"""
DARSI SIMRS — Data Cleaning Pipeline
=====================================
Input  : darsi_simrs.db  (place in same directory as this script)
Output : darsi_clean.db
Report : cleaning_report.json

Usage  : python3 cleaning_pipeline.py
         python3 cleaning_pipeline.py --input /path/to/darsi_simrs.db
"""

import sqlite3
import re
import json
import os
import shutil
import sys
from datetime import datetime
from difflib import SequenceMatcher

# ─── Configuration ────────────────────────────────────────────────────────────

INPUT_DB   = "darsi_simrs.db"
OUTPUT_DB  = "darsi_clean.db"
REPORT_FILE = "cleaning_report.json"

# ─── Lookup tables ────────────────────────────────────────────────────────────

NOISE_VALUES = {"n/a", "null", "-", "?", "na", "unknown", "none", ""}

_ID_FULL = {
    "januari": 1,  "februari": 2,  "maret": 3,    "april": 4,
    "mei": 5,      "juni": 6,      "juli": 7,      "agustus": 8,
    "september": 9,"oktober": 10,  "november": 11, "desember": 12,
}
_ID_ABBR = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4,
    "mei": 5, "jun": 6, "jul": 7, "ags": 8,
    "sep": 9, "okt": 10,"nov": 11,"des": 12,
}
_EN_ABBR = {
    "jan": 1,"feb": 2,"mar": 3,"apr": 4,"may": 5,"jun": 6,
    "jul": 7,"aug": 8,"sep": 9,"oct": 10,"nov": 11,"dec": 12,
}

# ─── Pure helper functions ────────────────────────────────────────────────────

def is_noise(value):
    if value is None:
        return True
    return str(value).strip().lower() in NOISE_VALUES


def normalize_date(raw):
    """Return ISO YYYY-MM-DD string or None."""
    if is_noise(raw):
        return None
    s = str(raw).strip()

    # Already ISO
    m = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        return s

    # yyyymmdd compact
    m = re.fullmatch(r"(\d{4})(\d{2})(\d{2})", s)
    if m:
        return "{}-{}-{}".format(m.group(1), m.group(2), m.group(3))

    # dd/mm/yyyy or dd-mm-yyyy
    m = re.fullmatch(r"(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})", s)
    if m:
        return "{}-{}-{}".format(m.group(3), m.group(2).zfill(2), m.group(1).zfill(2))

    # "15 Jan 2023" / "15 Januari 2023"
    m = re.fullmatch(r"(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})", s)
    if m:
        day, mon_s, year = m.group(1), m.group(2).lower(), m.group(3)
        month = _ID_FULL.get(mon_s) or _ID_ABBR.get(mon_s) or _EN_ABBR.get(mon_s[:3])
        if month:
            return "{}-{}-{}".format(year, str(month).zfill(2), day.zfill(2))

    # "Jan 15, 2023"
    m = re.fullmatch(r"([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})", s)
    if m:
        mon_s, day, year = m.group(1).lower(), m.group(2), m.group(3)
        month = _ID_FULL.get(mon_s) or _ID_ABBR.get(mon_s) or _EN_ABBR.get(mon_s[:3])
        if month:
            return "{}-{}-{}".format(year, str(month).zfill(2), day.zfill(2))

    return None  # unparseable → NULL


def normalize_jenis_kelamin(raw):
    if is_noise(raw):
        return None
    v = str(raw).strip().lower()
    if v in {"l", "laki", "laki-laki", "m", "male"}:
        return "Laki-laki"
    if v in {"p", "pr", "perempuan", "f", "female", "wanita"}:
        return "Perempuan"
    return None


def normalize_status_kamar(raw):
    if is_noise(raw):
        return None
    v = str(raw).strip().lower()
    if v in {"tersedia", "kosong", "available"}:
        return "Tersedia"
    if v in {"penuh", "terisi", "full"}:
        return "Penuh"
    if v in {"maint", "maintenance", "pemeliharaan"}:
        return "Maintenance"
    return str(raw).strip()


def normalize_penjamin(raw):
    if is_noise(raw):
        return None
    v = str(raw).strip().lower()
    if re.search(r"bpjs", v):
        return "BPJS"
    if re.search(r"swasta|axa|prudential|allianz|manulife|cigna|asuransi", v):
        return "Asuransi Swasta"
    if re.search(r"umum|mandiri", v):
        return "Umum"
    return str(raw).strip()


def normalize_jenis_kamar(raw):
    if is_noise(raw):
        return None
    v = str(raw).strip().lower()
    if "icu" in v:
        return "ICU"
    if "vip" in v:
        return "VIP"
    if "1" in v or "satu" in v:
        return "Kelas 1"
    if "2" in v or "dua" in v:
        return "Kelas 2"
    if "3" in v or "tiga" in v:
        return "Kelas 3"
    return str(raw).strip().title()


def clean_text(raw):
    """Strip whitespace; replace noise with None."""
    if raw is None:
        return None
    s = str(raw).strip()
    if s.lower() in NOISE_VALUES:
        return None
    return s


def clean_numeric(value, allow_zero=False):
    """Return None for negative values (or zero when not allowed)."""
    if value is None:
        return None
    try:
        n = float(value)
        if n < 0:
            return None
        if not allow_zero and n == 0:
            return None
        return value
    except (ValueError, TypeError):
        return None


def similarity(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def blank_stats():
    return {
        "total_rows": 0,
        "dates_normalized": 0,
        "ids_normalized": 0,
        "nulls_filled": 0,
        "invalid_values_nulled": 0,
        "duplicates_flagged": 0,
        "noise_replaced": 0,
    }


# ─── Pipeline class ───────────────────────────────────────────────────────────

class DARSICleaner:

    def __init__(self, src=INPUT_DB, dst=OUTPUT_DB):
        if not os.path.exists(src):
            raise FileNotFoundError(
                "Source database not found: {}\n"
                "Copy darsi_simrs.db into this directory first.".format(src)
            )
        shutil.copy2(src, dst)
        self.conn = sqlite3.connect(dst)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.report = {}
        print("\n🏥  DARSI Cleaning Pipeline")
        print("    src → {}".format(src))
        print("    dst → {}".format(dst))
        print("─" * 52)

    # ── internal helpers ──────────────────────────────────────────────────────

    def _cols(self, table):
        cur = self.conn.execute("PRAGMA table_info({})".format(table))
        return [r["name"] for r in cur.fetchall()]

    def _rows(self, table):
        return self.conn.execute("SELECT * FROM {}".format(table)).fetchall()

    def _upd(self, table, pk_col, pk_val, col, val):
        sql = 'UPDATE "{}" SET "{}"=? WHERE "{}"=?'.format(table, col, pk_col)
        self.conn.execute(sql, (val, pk_val))

    def _log(self, label, stats):
        print(
            "  ✔ {:<20} {:>4} rows | dates:{} noise:{} invalid:{} dups:{}".format(
                label,
                stats["total_rows"],
                stats["dates_normalized"],
                stats["noise_replaced"],
                stats["invalid_values_nulled"],
                stats["duplicates_flagged"],
            )
        )

    # ── step 1: pasien ────────────────────────────────────────────────────────

    def clean_pasien(self):
        stats = blank_stats()
        rows = self._rows("pasien")
        stats["total_rows"] = len(rows)

        for row in rows:
            pk = row["id_pasien"]

            # tanggal_lahir
            orig = row["tanggal_lahir"]
            fixed = normalize_date(orig)
            if fixed != orig:
                self._upd("pasien", "id_pasien", pk, "tanggal_lahir", fixed)
                if fixed and orig:
                    stats["dates_normalized"] += 1
                else:
                    stats["noise_replaced"] += 1

            # jenis_kelamin
            orig = row["jenis_kelamin"]
            fixed = normalize_jenis_kelamin(orig)
            if fixed != orig:
                self._upd("pasien", "id_pasien", pk, "jenis_kelamin", fixed)
                if fixed is None:
                    stats["noise_replaced"] += 1
                else:
                    stats["ids_normalized"] += 1

            # penjamin
            orig = row["penjamin"]
            fixed = normalize_penjamin(orig)
            if fixed != orig:
                self._upd("pasien", "id_pasien", pk, "penjamin", fixed)
                stats["ids_normalized"] += 1

            # nama → title case
            orig = row["nama"]
            if not is_noise(orig):
                fixed = str(orig).strip().title()
                if fixed != orig:
                    self._upd("pasien", "id_pasien", pk, "nama", fixed)
                    stats["noise_replaced"] += 1

            # plain text fields
            for col in ("alamat", "no_telepon", "no_penjamin", "asuransi_swasta"):
                if col not in self._cols("pasien"):
                    continue
                orig = row[col]
                fixed = clean_text(orig)
                if fixed != orig:
                    self._upd("pasien", "id_pasien", pk, col, fixed)
                    stats["noise_replaced"] += 1

        self.conn.commit()
        self.report["pasien"] = stats
        self._log("pasien", stats)

    # ── step 2: duplicate pasien ──────────────────────────────────────────────

    def flag_duplicate_pasien(self):
        if "is_duplicate" not in self._cols("pasien"):
            self.conn.execute(
                "ALTER TABLE pasien ADD COLUMN is_duplicate INTEGER DEFAULT 0"
            )
            self.conn.commit()

        rows = self.conn.execute(
            "SELECT id_pasien, nama, tanggal_lahir FROM pasien ORDER BY id_pasien"
        ).fetchall()

        seen = []   # list of (id, nama, tgl)
        flagged = 0

        for row in rows:
            pid = row["id_pasien"]
            nama = row["nama"] or ""
            tgl  = row["tanggal_lahir"]
            dup  = 0

            for _, s_nama, s_tgl in seen:
                if tgl and s_tgl and tgl == s_tgl:
                    if similarity(nama, s_nama) > 0.80:
                        dup = 1
                        flagged += 1
                        break

            if not dup:
                seen.append((pid, nama, tgl))

            self.conn.execute(
                "UPDATE pasien SET is_duplicate=? WHERE id_pasien=?", (dup, pid)
            )

        self.conn.commit()
        self.report["pasien"]["duplicates_flagged"] = flagged
        print("  ✔ dup-detection       {} near-duplicates flagged".format(flagged))

    # ── step 3: kamar ─────────────────────────────────────────────────────────

    def clean_kamar(self):
        stats = blank_stats()
        rows = self._rows("kamar")
        stats["total_rows"] = len(rows)

        for row in rows:
            pk = row["no_kamar"]

            orig = row["jenis_kamar"]
            fixed = normalize_jenis_kamar(orig)
            if fixed != orig:
                self._upd("kamar", "no_kamar", pk, "jenis_kamar", fixed)
                stats["ids_normalized"] += 1

            orig = row["status"]
            fixed = normalize_status_kamar(orig)
            if fixed != orig:
                self._upd("kamar", "no_kamar", pk, "status", fixed)
                stats["noise_replaced"] += 1

            orig = row["tarif_per_malam"]
            fixed = clean_numeric(orig, allow_zero=True)
            if fixed != orig:
                self._upd("kamar", "no_kamar", pk, "tarif_per_malam", fixed)
                stats["invalid_values_nulled"] += 1

        self.conn.commit()
        self.report["kamar"] = stats
        self._log("kamar", stats)

    # ── step 4: rawat_inap ────────────────────────────────────────────────────

    def clean_rawat_inap(self):
        stats = blank_stats()
        rows = self._rows("rawat_inap")
        stats["total_rows"] = len(rows)

        for row in rows:
            pk = row["id_rawat"]

            for col in ("tanggal_masuk", "tanggal_keluar"):
                orig = row[col]
                fixed = normalize_date(orig)
                if fixed != orig:
                    self._upd("rawat_inap", "id_rawat", pk, col, fixed)
                    if fixed and orig:
                        stats["dates_normalized"] += 1
                    else:
                        stats["noise_replaced"] += 1

            orig = row["lama_rawat"]
            fixed = clean_numeric(orig)
            if fixed != orig:
                self._upd("rawat_inap", "id_rawat", pk, "lama_rawat", fixed)
                stats["invalid_values_nulled"] += 1

            for col in ("diagnosa", "dokter", "status"):
                orig = row[col]
                fixed = clean_text(orig)
                if fixed != orig:
                    self._upd("rawat_inap", "id_rawat", pk, col, fixed)
                    stats["noise_replaced"] += 1

        self.conn.commit()
        self.report["rawat_inap"] = stats
        self._log("rawat_inap", stats)

    # ── step 5: tagihan ───────────────────────────────────────────────────────

    def clean_tagihan(self):
        stats = blank_stats()
        rows = self._rows("tagihan")
        stats["total_rows"] = len(rows)

        for row in rows:
            pk = row["id_tagihan"]

            for col in ("biaya_kamar", "biaya_tindakan", "biaya_obat", "total_tagihan"):
                orig = row[col]
                fixed = clean_numeric(orig, allow_zero=True)
                if fixed != orig:
                    self._upd("tagihan", "id_tagihan", pk, col, fixed)
                    stats["invalid_values_nulled"] += 1

            orig = row["tanggal_bayar"]
            fixed = normalize_date(orig)
            if fixed != orig:
                self._upd("tagihan", "id_tagihan", pk, "tanggal_bayar", fixed)
                stats["dates_normalized"] += 1

            for col in ("status_bayar", "metode_bayar"):
                orig = row[col]
                fixed = clean_text(orig)
                if fixed != orig:
                    self._upd("tagihan", "id_tagihan", pk, col, fixed)
                    stats["noise_replaced"] += 1

        self.conn.commit()
        self.report["tagihan"] = stats
        self._log("tagihan", stats)

    # ── step 6: klaim_asuransi ────────────────────────────────────────────────

    def clean_klaim_asuransi(self):
        stats = blank_stats()
        rows = self._rows("klaim_asuransi")
        stats["total_rows"] = len(rows)

        for row in rows:
            pk = row["id_klaim"]

            for col in ("tanggal_klaim", "tanggal_selesai"):
                orig = row[col]
                fixed = normalize_date(orig)
                if fixed != orig:
                    self._upd("klaim_asuransi", "id_klaim", pk, col, fixed)
                    stats["dates_normalized"] += 1

            for col in ("total_klaim", "disetujui"):
                orig = row[col]
                fixed = clean_numeric(orig, allow_zero=True)
                if fixed != orig:
                    self._upd("klaim_asuransi", "id_klaim", pk, col, fixed)
                    stats["invalid_values_nulled"] += 1

            orig = row["penjamin"]
            fixed = normalize_penjamin(orig)
            if fixed != orig:
                self._upd("klaim_asuransi", "id_klaim", pk, "penjamin", fixed)
                stats["ids_normalized"] += 1

            for col in ("nama_asuransi", "status_klaim"):
                orig = row[col]
                fixed = clean_text(orig)
                if fixed != orig:
                    self._upd("klaim_asuransi", "id_klaim", pk, col, fixed)
                    stats["noise_replaced"] += 1

        self.conn.commit()
        self.report["klaim_asuransi"] = stats
        self._log("klaim_asuransi", stats)

    # ── step 7: detail_tindakan ───────────────────────────────────────────────

    def clean_detail_tindakan(self):
        stats = blank_stats()
        rows = self._rows("detail_tindakan")
        stats["total_rows"] = len(rows)

        for row in rows:
            pk = row["id"]

            orig = row["tanggal"]
            fixed = normalize_date(orig)
            if fixed != orig:
                self._upd("detail_tindakan", "id", pk, "tanggal", fixed)
                stats["dates_normalized"] += 1

            orig = row["biaya"]
            fixed = clean_numeric(orig, allow_zero=True)
            if fixed != orig:
                self._upd("detail_tindakan", "id", pk, "biaya", fixed)
                stats["invalid_values_nulled"] += 1

            orig = row["tindakan"]
            fixed = clean_text(orig)
            if fixed != orig:
                self._upd("detail_tindakan", "id", pk, "tindakan", fixed)
                stats["noise_replaced"] += 1

        self.conn.commit()
        self.report["detail_tindakan"] = stats
        self._log("detail_tindakan", stats)

    # ── step 8: detail_obat ───────────────────────────────────────────────────

    def clean_detail_obat(self):
        stats = blank_stats()
        rows = self._rows("detail_obat")
        stats["total_rows"] = len(rows)

        for row in rows:
            pk = row["id"]

            orig = row["tanggal"]
            fixed = normalize_date(orig)
            if fixed != orig:
                self._upd("detail_obat", "id", pk, "tanggal", fixed)
                stats["dates_normalized"] += 1

            for col in ("harga_satuan", "jumlah", "subtotal"):
                orig = row[col]
                fixed = clean_numeric(orig, allow_zero=True)
                if fixed != orig:
                    self._upd("detail_obat", "id", pk, col, fixed)
                    stats["invalid_values_nulled"] += 1

            orig = row["nama_obat"]
            fixed = clean_text(orig)
            if fixed != orig:
                self._upd("detail_obat", "id", pk, "nama_obat", fixed)
                stats["noise_replaced"] += 1

        self.conn.commit()
        self.report["detail_obat"] = stats
        self._log("detail_obat", stats)

    # ── step 9: tarif_layanan ─────────────────────────────────────────────────

    def clean_tarif_layanan(self):
        stats = blank_stats()
        rows = self._rows("tarif_layanan")
        stats["total_rows"] = len(rows)

        for row in rows:
            pk = row["id_tarif"]

            orig = row["berlaku_sejak"]
            fixed = normalize_date(orig)
            if fixed != orig:
                self._upd("tarif_layanan", "id_tarif", pk, "berlaku_sejak", fixed)
                stats["dates_normalized"] += 1

            orig = row["tarif"]
            fixed = clean_numeric(orig, allow_zero=True)
            if fixed != orig:
                self._upd("tarif_layanan", "id_tarif", pk, "tarif", fixed)
                stats["invalid_values_nulled"] += 1

            for col in ("kategori", "nama_layanan"):
                orig = row[col]
                fixed = clean_text(orig)
                if fixed != orig:
                    self._upd("tarif_layanan", "id_tarif", pk, col, fixed)
                    stats["noise_replaced"] += 1

        self.conn.commit()
        self.report["tarif_layanan"] = stats
        self._log("tarif_layanan", stats)

    # ── step 10: biaya_operasional ────────────────────────────────────────────

    def clean_biaya_operasional(self):
        stats = blank_stats()
        rows = self._rows("biaya_operasional")
        stats["total_rows"] = len(rows)

        for row in rows:
            pk = row["id"]

            orig = row["jumlah"]
            fixed = clean_numeric(orig, allow_zero=True)
            if fixed != orig:
                self._upd("biaya_operasional", "id", pk, "jumlah", fixed)
                stats["invalid_values_nulled"] += 1

            for col in ("bulan", "kategori"):
                orig = row[col]
                fixed = clean_text(orig)
                if fixed != orig:
                    self._upd("biaya_operasional", "id", pk, col, fixed)
                    stats["noise_replaced"] += 1

        self.conn.commit()
        self.report["biaya_operasional"] = stats
        self._log("biaya_operasional", stats)

    # ── report ────────────────────────────────────────────────────────────────

    def save_report(self):
        output = {
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "source_db": INPUT_DB,
            "output_db": OUTPUT_DB,
            "tables": self.report,
        }
        with open(REPORT_FILE, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        print("\n📄 Report saved → {}".format(REPORT_FILE))

    # ── run all ───────────────────────────────────────────────────────────────

    def run(self):
        self.clean_pasien()
        self.flag_duplicate_pasien()
        self.clean_kamar()
        self.clean_rawat_inap()
        self.clean_tagihan()
        self.clean_klaim_asuransi()
        self.clean_detail_tindakan()
        self.clean_detail_obat()
        self.clean_tarif_layanan()
        self.clean_biaya_operasional()
        print("─" * 52)
        self.save_report()
        self.conn.close()

        # summary
        total_changes = sum(
            s["dates_normalized"] + s["noise_replaced"] +
            s["invalid_values_nulled"] + s["ids_normalized"] +
            s["duplicates_flagged"]
            for s in self.report.values()
        )
        print("\n✅  Done! Total changes: {}".format(total_changes))
        print("    Output → {}\n".format(OUTPUT_DB))


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    src = INPUT_DB
    dst = OUTPUT_DB

    # Allow --input override
    args = sys.argv[1:]
    if "--input" in args:
        idx = args.index("--input")
        if idx + 1 < len(args):
            src = args[idx + 1]
    if "--output" in args:
        idx = args.index("--output")
        if idx + 1 < len(args):
            dst = args[idx + 1]

    cleaner = DARSICleaner(src=src, dst=dst)
    cleaner.run()
