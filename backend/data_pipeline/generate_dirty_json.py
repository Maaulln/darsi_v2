"""Generator JSON database kotor untuk DARSI SIMRS.

Skrip ini membuat satu file JSON berisi data mentah yang sengaja tidak rapi,
misalnya format tanggal campur aduk, nilai noise seperti N/A atau '-', label
kategori tidak konsisten, dan angka negatif. Output ini cocok sebagai input
awal sebelum diproses oleh pipeline cleaning dan dimuat ke SQLite3.
"""

from __future__ import annotations

import argparse
import json
import random
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Sequence


DEFAULT_OUTPUT = "darsi_dirty.json"
DEFAULT_SEED = 42

NOISE_VALUES: Sequence[Any] = ("N/A", "null", "-", "?", "na", "unknown", "none", "")
DATE_VARIANTS = (
    "iso",
    "slash",
    "dash",
    "compact",
    "id_long",
    "id_short",
    "en_short",
    "month_first",
)


@dataclass(frozen=True)
class DirtyConfig:
    """Konfigurasi generator data kotor."""

    jumlah_pasien: int = 24
    jumlah_kamar: int = 18
    jumlah_rawat: int = 36
    jumlah_tindakan: int = 32
    jumlah_obat: int = 34
    jumlah_tarif: int = 20
    jumlah_operasional: int = 16


def build_parser() -> argparse.ArgumentParser:
    """Membuat parser argumen CLI untuk generator JSON.

    Returns:
        argparse.ArgumentParser: Parser yang siap dipakai untuk membaca opsi CLI.
    """
    parser = argparse.ArgumentParser(
        description="Generate JSON database kotor untuk DARSI SIMRS",
    )
    parser.add_argument(
        "--output",
        default=DEFAULT_OUTPUT,
        help=f"Nama file output JSON (default: {DEFAULT_OUTPUT})",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=DEFAULT_SEED,
        help=f"Seed acak agar hasil bisa diulang (default: {DEFAULT_SEED})",
    )
    parser.add_argument(
        "--patients",
        type=int,
        default=DirtyConfig.jumlah_pasien,
        help="Jumlah data pasien yang dibuat",
    )
    parser.add_argument(
        "--rooms",
        type=int,
        default=DirtyConfig.jumlah_kamar,
        help="Jumlah data kamar yang dibuat",
    )
    parser.add_argument(
        "--admissions",
        type=int,
        default=DirtyConfig.jumlah_rawat,
        help="Jumlah data rawat inap yang dibuat",
    )
    parser.add_argument(
        "--procedures",
        type=int,
        default=DirtyConfig.jumlah_tindakan,
        help="Jumlah data detail tindakan yang dibuat",
    )
    parser.add_argument(
        "--medications",
        type=int,
        default=DirtyConfig.jumlah_obat,
        help="Jumlah data detail obat yang dibuat",
    )
    parser.add_argument(
        "--tariffs",
        type=int,
        default=DirtyConfig.jumlah_tarif,
        help="Jumlah data tarif layanan yang dibuat",
    )
    parser.add_argument(
        "--operations",
        type=int,
        default=DirtyConfig.jumlah_operasional,
        help="Jumlah data biaya operasional yang dibuat",
    )
    return parser


def pick_noise(rng: random.Random) -> Any:
    """Mengambil nilai noise acak.

    Args:
        rng: Generator acak yang dipakai untuk memilih nilai.

    Returns:
        Any: Salah satu nilai noise seperti N/A, '-', atau kosong.
    """
    return rng.choice(list(NOISE_VALUES))


def maybe_noise(rng: random.Random, value: Any, chance: float = 0.12) -> Any:
    """Mengganti nilai tertentu menjadi noise secara acak.

    Args:
        rng: Generator acak.
        value: Nilai asli yang ingin disamarkan.
        chance: Probabilitas nilai diganti noise.

    Returns:
        Any: Nilai asli atau noise.
    """
    return pick_noise(rng) if rng.random() < chance else value


def make_dirty_date(rng: random.Random, base_date: datetime) -> Any:
    """Membuat tanggal dalam format yang sengaja tidak konsisten.

    Args:
        rng: Generator acak.
        base_date: Tanggal dasar untuk dimutasi.

    Returns:
        Any: Tanggal kotor dalam berbagai format atau noise.
    """
    if rng.random() < 0.08:
        return pick_noise(rng)

    date_value = base_date + timedelta(days=rng.randint(-70, 70))
    variant = rng.choice(DATE_VARIANTS)

    if variant == "iso":
        return date_value.strftime("%Y-%m-%d")
    if variant == "slash":
        return date_value.strftime("%d/%m/%Y")
    if variant == "dash":
        return date_value.strftime("%d-%m-%Y")
    if variant == "compact":
        return date_value.strftime("%Y%m%d")
    if variant == "id_long":
        return f"{date_value.day} {INDO_MONTH_LONG[date_value.month - 1]} {date_value.year}"
    if variant == "id_short":
        return f"{date_value.day} {INDO_MONTH_SHORT[date_value.month - 1]} {date_value.year}"
    if variant == "en_short":
        return f"{date_value.day} {ENG_MONTH_SHORT[date_value.month - 1]} {date_value.year}"
    return f"{ENG_MONTH_SHORT[date_value.month - 1]} {date_value.day}, {date_value.year}"


INDO_MONTH_LONG = (
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
)
INDO_MONTH_SHORT = (
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Ags",
    "Sep",
    "Okt",
    "Nov",
    "Des",
)
ENG_MONTH_SHORT = (
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
)


def format_currency_dirty(rng: random.Random, minimum: int = 50_000, maximum: int = 15_000_000) -> Any:
    """Membuat angka biaya yang kadang tidak valid.

    Args:
        rng: Generator acak.
        minimum: Batas bawah nilai biaya.
        maximum: Batas atas nilai biaya.

    Returns:
        Any: Bilangan bulat, string angka, angka negatif, atau noise.
    """
    if rng.random() < 0.1:
        return pick_noise(rng)

    value = rng.randint(minimum, maximum)
    mode = rng.choice(("int", "string", "comma", "negative", "float"))

    if mode == "int":
        return value
    if mode == "string":
        return str(value)
    if mode == "comma":
        return f"{value:,}".replace(",", ".")
    if mode == "negative":
        return -value
    return float(value) + 0.5


def make_text_dirty(rng: random.Random, value: str, chance: float = 0.18) -> Any:
    """Membuat teks dengan noise sederhana.

    Args:
        rng: Generator acak.
        value: Teks dasar.
        chance: Probabilitas nilai diubah.

    Returns:
        Any: Teks asli, versi acak huruf, atau noise.
    """
    if rng.random() < 0.07:
        return pick_noise(rng)
    if rng.random() < chance:
        variants = [
            value.lower(),
            value.upper(),
            f" {value} ",
            value.replace(" ", "  "),
            value.replace("a", "@"),
        ]
        return rng.choice(variants)
    return value


def make_phone_dirty(rng: random.Random, index: int) -> Any:
    """Membuat nomor telepon yang sengaja tidak seragam.

    Args:
        rng: Generator acak.
        index: Nomor urut untuk menjaga keunikan dasar.

    Returns:
        Any: Nomor telepon dalam format berbeda atau noise.
    """
    if rng.random() < 0.1:
        return pick_noise(rng)

    base = f"0812{index:08d}"
    style = rng.choice(("plain", "dash", "space", "plus62", "spaced"))

    if style == "plain":
        return base
    if style == "dash":
        return f"0812-{index:04d}-{index:04d}"
    if style == "space":
        return f"0812 {index:04d} {index:04d}"
    if style == "plus62":
        return f"+62 812 {index:04d} {index:04d}"
    return f"08 12 {index:04d} {index:04d}"


def make_patient_name(rng: random.Random, index: int) -> str:
    """Membuat nama pasien dasar.

    Args:
        rng: Generator acak.
        index: Nomor urut pasien.

    Returns:
        str: Nama pasien.
    """
    first_names = ("andika", "budi", "citra", "dina", "eka", "fajar", "gita", "hadi")
    last_names = ("santoso", "maharani", "putra", "wira", "nugroho", "lestari", "rahman")
    name = f"{rng.choice(first_names)} {rng.choice(last_names)} {index}"
    if rng.random() < 0.3:
        return f"{name.title()}  "
    if rng.random() < 0.2:
        return f"{name.upper()}"
    return name


def generate_pasien(rng: random.Random, count: int) -> List[Dict[str, Any]]:
    """Membuat data pasien kotor.

    Args:
        rng: Generator acak.
        count: Jumlah baris yang ingin dibuat.

    Returns:
        List[Dict[str, Any]]: Daftar record pasien.
    """
    rows: List[Dict[str, Any]] = []
    for index in range(1, count + 1):
        birth_base = datetime(1985, 1, 1) + timedelta(days=index * 240)
        duplicate_hint = rows[0] if index > 4 and rng.random() < 0.18 else None
        nama = duplicate_hint["nama"] if duplicate_hint else make_patient_name(rng, index)
        tanggal_lahir = duplicate_hint["tanggal_lahir"] if duplicate_hint else make_dirty_date(rng, birth_base)
        penjamin = rng.choice(("BPJS", "bpjs", "JKN", "Asuransi Swasta", "swasta", "umum", "Mandiri", "N/A"))
        row = {
            "id_pasien": f"P{index:04d}",
            "nama": maybe_noise(rng, nama, 0.05),
            "tanggal_lahir": tanggal_lahir,
            "jenis_kelamin": rng.choice(("L", "P", "laki-laki", "Perempuan", "male", "wanita", "pr", "?")),
            "penjamin": maybe_noise(rng, penjamin, 0.08),
            "alamat": make_text_dirty(rng, f"Jl. Melati No. {index}", 0.25),
            "no_telepon": make_phone_dirty(rng, index),
            "no_penjamin": maybe_noise(rng, f"JP{index:06d}", 0.12),
            "asuransi_swasta": maybe_noise(rng, rng.choice(("Prudential", "Allianz", "AXA", "Manulife", "Cigna", "")), 0.2),
        }
        rows.append(row)
    return rows


def generate_kamar(rng: random.Random, count: int) -> List[Dict[str, Any]]:
    """Membuat data kamar kotor.

    Args:
        rng: Generator acak.
        count: Jumlah baris.

    Returns:
        List[Dict[str, Any]]: Daftar record kamar.
    """
    kelas_variants = ("ICU", "Vip", "kelas satu", "kelas 2", "3", "Kelas Tiga", "VIP", "icu")
    status_variants = ("Tersedia", "kosong", "Penuh", "Terisi", "available", "maintenance", "maint")
    rows: List[Dict[str, Any]] = []
    for index in range(1, count + 1):
        rows.append(
            {
                "no_kamar": f"K{index:03d}",
                "jenis_kamar": maybe_noise(rng, rng.choice(kelas_variants), 0.08),
                "status": maybe_noise(rng, rng.choice(status_variants), 0.1),
                "tarif_per_malam": format_currency_dirty(rng, 250_000, 5_000_000),
            }
        )
    return rows


def dirty_status_pasien(rng: random.Random) -> Any:
    """Membuat status rawat inap yang sengaja tidak konsisten.

    Args:
        rng: Generator acak.

    Returns:
        Any: Status rawat inap.
    """
    return rng.choice(("Aktif", "aktif", "Selesai", "selesai", "discharge", "Proses", "-"))


def generate_rawat_inap(rng: random.Random, count: int, pasien_ids: Sequence[str], kamar_ids: Sequence[str]) -> List[Dict[str, Any]]:
    """Membuat data rawat inap kotor.

    Args:
        rng: Generator acak.
        count: Jumlah baris.
        pasien_ids: Daftar id pasien untuk relasi.
        kamar_ids: Daftar nomor kamar untuk relasi.

    Returns:
        List[Dict[str, Any]]: Daftar record rawat inap.
    """
    diagnosa_variants = (
        "Demam Berdarah",
        "dbd",
        "Pneumonia",
        "ISPA",
        "Hipertensi",
        "Diabetes Mellitus",
        "infeksi saluran napas",
    )
    dokter_variants = (
        "dr. Andi",
        "dokter budi",
        "DR Citra",
        "dr. Eka",
        "spesialis anak",
        "Sp. PD",
    )
    rows: List[Dict[str, Any]] = []
    for index in range(1, count + 1):
        base_date = datetime(2024, 1, 1) + timedelta(days=index * 3)
        start_date = make_dirty_date(rng, base_date)
        end_date = make_dirty_date(rng, base_date + timedelta(days=rng.randint(1, 14)))
        rows.append(
            {
                "id_rawat": f"R{index:04d}",
                "id_pasien": rng.choice(pasien_ids),
                "no_kamar": rng.choice(kamar_ids),
                "tanggal_masuk": start_date,
                "tanggal_keluar": end_date,
                "lama_rawat": rng.choice((rng.randint(1, 20), rng.randint(-8, 0), 0, "3", "?")),
                "diagnosa": maybe_noise(rng, rng.choice(diagnosa_variants), 0.15),
                "dokter": maybe_noise(rng, rng.choice(dokter_variants), 0.12),
                "status": maybe_noise(rng, dirty_status_pasien(rng), 0.12),
            }
        )
    return rows


def generate_tagihan(rng: random.Random, count: int, rawat_ids: Sequence[str]) -> List[Dict[str, Any]]:
    """Membuat data tagihan kotor.

    Args:
        rng: Generator acak.
        count: Jumlah baris.
        rawat_ids: Daftar id rawat inap.

    Returns:
        List[Dict[str, Any]]: Daftar record tagihan.
    """
    rows: List[Dict[str, Any]] = []
    for index in range(1, count + 1):
        base_date = datetime(2024, 2, 1) + timedelta(days=index * 2)
        biaya_kamar = format_currency_dirty(rng, 150_000, 6_000_000)
        biaya_tindakan = format_currency_dirty(rng, 50_000, 4_000_000)
        biaya_obat = format_currency_dirty(rng, 25_000, 3_000_000)
        total_tagihan = rng.choice((
            format_currency_dirty(rng, 200_000, 10_000_000),
            -rng.randint(50_000, 5_000_000),
            "",
            f"{rng.randint(200_000, 10_000_000):,}",
        ))
        rows.append(
            {
                "id_tagihan": f"T{index:04d}",
                "id_rawat": rng.choice(rawat_ids),
                "biaya_kamar": biaya_kamar,
                "biaya_tindakan": biaya_tindakan,
                "biaya_obat": biaya_obat,
                "total_tagihan": total_tagihan,
                "tanggal_bayar": make_dirty_date(rng, base_date),
                "status_bayar": rng.choice(("Lunas", "lunas", "Belum Bayar", "belum bayar", "proses", "N/A")),
                "metode_bayar": rng.choice(("Transfer", "cash", "Kartu", "BPJS", "QRIS", "-")),
            }
        )
    return rows


def generate_klaim_asuransi(rng: random.Random, count: int, rawat_ids: Sequence[str]) -> List[Dict[str, Any]]:
    """Membuat data klaim asuransi kotor.

    Args:
        rng: Generator acak.
        count: Jumlah baris.
        rawat_ids: Daftar id rawat.

    Returns:
        List[Dict[str, Any]]: Daftar record klaim.
    """
    rows: List[Dict[str, Any]] = []
    for index in range(1, count + 1):
        base_date = datetime(2024, 2, 10) + timedelta(days=index * 4)
        rows.append(
            {
                "id_klaim": f"C{index:04d}",
                "id_rawat": rng.choice(rawat_ids),
                "tanggal_klaim": make_dirty_date(rng, base_date),
                "tanggal_selesai": make_dirty_date(rng, base_date + timedelta(days=rng.randint(3, 30))),
                "total_klaim": rng.choice((format_currency_dirty(rng, 100_000, 8_000_000), -rng.randint(50_000, 2_000_000), "-")),
                "disetujui": rng.choice((format_currency_dirty(rng, 50_000, 7_000_000), -rng.randint(10_000, 1_500_000), "N/A")),
                "penjamin": rng.choice(("BPJS", "bpjs", "asuransi swasta", "umum", "mandiri", "JKN")),
                "nama_asuransi": maybe_noise(rng, rng.choice(("Prudential", "Allianz", "AXA", "Cigna", "Asuransi Sehat", "")), 0.2),
                "status_klaim": rng.choice(("Proses", "proses", "Disetujui", "ditolak", "-")),
            }
        )
    return rows


def generate_detail_tindakan(rng: random.Random, count: int, rawat_ids: Sequence[str]) -> List[Dict[str, Any]]:
    """Membuat data detail tindakan kotor.

    Args:
        rng: Generator acak.
        count: Jumlah baris.
        rawat_ids: Daftar id rawat.

    Returns:
        List[Dict[str, Any]]: Daftar record tindakan.
    """
    tindakan_variants = (
        "Rontgen Dada",
        "USG Abdomen",
        "Pemasangan Infus",
        "Suntikan Antibiotik",
        "CT Scan",
        "Tindakan Minor",
    )
    rows: List[Dict[str, Any]] = []
    for index in range(1, count + 1):
        rows.append(
            {
                "id": f"DT{index:04d}",
                "id_rawat": rng.choice(rawat_ids),
                "tanggal": make_dirty_date(rng, datetime(2024, 3, 1) + timedelta(days=index)),
                "tindakan": maybe_noise(rng, rng.choice(tindakan_variants), 0.18),
                "biaya": rng.choice((format_currency_dirty(rng, 20_000, 2_500_000), -rng.randint(1_000, 500_000), "0", "?")),
            }
        )
    return rows


def generate_detail_obat(rng: random.Random, count: int, rawat_ids: Sequence[str]) -> List[Dict[str, Any]]:
    """Membuat data detail obat kotor.

    Args:
        rng: Generator acak.
        count: Jumlah baris.
        rawat_ids: Daftar id rawat.

    Returns:
        List[Dict[str, Any]]: Daftar record obat.
    """
    obat_variants = (
        "Paracetamol",
        "Amoxicillin",
        "Cefixime",
        "Ranitidine",
        "Omeprazole",
        "Vitamin C",
        "NaCl 0.9%",
    )
    rows: List[Dict[str, Any]] = []
    for index in range(1, count + 1):
        satuan = rng.choice((500, 1000, 2500, -500, 0, "1.500"))
        jumlah = rng.choice((1, 2, 3, -1, 0, "2"))
        subtotal = rng.choice((format_currency_dirty(rng, 5_000, 250_000), -rng.randint(1_000, 100_000), "-"))
        rows.append(
            {
                "id": f"DO{index:04d}",
                "id_rawat": rng.choice(rawat_ids),
                "tanggal": make_dirty_date(rng, datetime(2024, 3, 5) + timedelta(days=index)),
                "nama_obat": maybe_noise(rng, rng.choice(obat_variants), 0.15),
                "harga_satuan": satuan,
                "jumlah": jumlah,
                "subtotal": subtotal,
            }
        )
    return rows


def generate_tarif_layanan(rng: random.Random, count: int) -> List[Dict[str, Any]]:
    """Membuat data tarif layanan kotor.

    Args:
        rng: Generator acak.
        count: Jumlah baris.

    Returns:
        List[Dict[str, Any]]: Daftar record tarif.
    """
    layanan_variants = (
        "Konsultasi Dokter",
        "Tindakan Medis",
        "Laboratorium",
        "Radiologi",
        "Farmasi",
        "Rawat Inap VIP",
        "Rawat Inap Kelas 1",
    )
    kategori_variants = ("medis", "non medis", "admin", "Layanan", "service", "-")
    rows: List[Dict[str, Any]] = []
    for index in range(1, count + 1):
        rows.append(
            {
                "id_tarif": f"TR{index:04d}",
                "nama_layanan": maybe_noise(rng, rng.choice(layanan_variants), 0.16),
                "kategori": maybe_noise(rng, rng.choice(kategori_variants), 0.15),
                "tarif": rng.choice((format_currency_dirty(rng, 25_000, 3_000_000), -rng.randint(10_000, 500_000), "N/A")),
                "berlaku_sejak": make_dirty_date(rng, datetime(2024, 1, 15) + timedelta(days=index * 5)),
            }
        )
    return rows


def generate_biaya_operasional(rng: random.Random, count: int) -> List[Dict[str, Any]]:
    """Membuat data biaya operasional kotor.

    Args:
        rng: Generator acak.
        count: Jumlah baris.

    Returns:
        List[Dict[str, Any]]: Daftar record operasional.
    """
    kategori_variants = (
        "Listrik",
        "Air",
        "ATK",
        "Maintenance",
        "Logistik",
        "Kebersihan",
        "Transport",
    )
    rows: List[Dict[str, Any]] = []
    for index in range(1, count + 1):
        bulan = datetime(2024, ((index - 1) % 12) + 1, 1)
        rows.append(
            {
                "id": f"BO{index:04d}",
                "bulan": make_dirty_date(rng, bulan),
                "kategori": maybe_noise(rng, rng.choice(kategori_variants), 0.17),
                "jumlah": rng.choice((format_currency_dirty(rng, 100_000, 2_000_000), -rng.randint(10_000, 750_000), 0, "N/A")),
            }
        )
    return rows


def build_dataset(config: DirtyConfig, rng: random.Random) -> Dict[str, Any]:
    """Menyusun seluruh dataset JSON kotor.

    Args:
        config: Konfigurasi jumlah baris per tabel.
        rng: Generator acak.

    Returns:
        Dict[str, Any]: Struktur root JSON yang siap diserialisasi.
    """
    pasien = generate_pasien(rng, config.jumlah_pasien)
    kamar = generate_kamar(rng, config.jumlah_kamar)
    pasien_ids = [row["id_pasien"] for row in pasien]
    kamar_ids = [row["no_kamar"] for row in kamar]
    rawat_inap = generate_rawat_inap(rng, config.jumlah_rawat, pasien_ids, kamar_ids)
    rawat_ids = [row["id_rawat"] for row in rawat_inap]

    dataset = {
        "metadata": {
            "nama": "DARSI SIMRS Dirty Seed",
            "generated_at": datetime.now().isoformat(timespec="seconds"),
            "format": "root.tables[]",
            "catatan": "Data ini sengaja kotor untuk diuji di pipeline cleaning.",
        },
        "schema_version": 1,
        "tables": {
            "pasien": pasien,
            "kamar": kamar,
            "rawat_inap": rawat_inap,
            "tagihan": generate_tagihan(rng, config.jumlah_rawat, rawat_ids),
            "klaim_asuransi": generate_klaim_asuransi(rng, max(12, config.jumlah_rawat // 2), rawat_ids),
            "detail_tindakan": generate_detail_tindakan(rng, config.jumlah_tindakan, rawat_ids),
            "detail_obat": generate_detail_obat(rng, config.jumlah_obat, rawat_ids),
            "tarif_layanan": generate_tarif_layanan(rng, config.jumlah_tarif),
            "biaya_operasional": generate_biaya_operasional(rng, config.jumlah_operasional),
        },
    }
    return dataset


def write_json(path: Path, payload: Dict[str, Any]) -> None:
    """Menulis payload JSON ke file.

    Args:
        path: Lokasi file output.
        payload: Data yang akan ditulis.

    Returns:
        None
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file_handle:
        json.dump(payload, file_handle, ensure_ascii=False, indent=2)


def main() -> int:
    """Menjalankan generator JSON kotor dari CLI.

    Returns:
        int: Kode keluar proses. 0 berarti sukses.
    """
    parser = build_parser()
    args = parser.parse_args()

    rng = random.Random(args.seed)
    config = DirtyConfig(
        jumlah_pasien=args.patients,
        jumlah_kamar=args.rooms,
        jumlah_rawat=args.admissions,
        jumlah_tindakan=args.procedures,
        jumlah_obat=args.medications,
        jumlah_tarif=args.tariffs,
        jumlah_operasional=args.operations,
    )
    dataset = build_dataset(config, rng)
    output_path = Path(args.output)
    write_json(output_path, dataset)

    print(f"JSON kotor berhasil dibuat: {output_path}")
    print(f"Total tabel: {len(dataset['tables'])}")
    print(f"Total pasien: {len(dataset['tables']['pasien'])}")
    print(f"Total rawat inap: {len(dataset['tables']['rawat_inap'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
