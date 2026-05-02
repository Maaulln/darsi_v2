"""Konversi JSON database kotor DARSI menjadi SQLite3.

Skrip ini membaca file JSON hasil generator dirty seed, membuat tabel SQLite
sesuai isi setiap tabel di JSON, lalu mengisi baris data mentah tanpa cleaning.
Hasilnya cocok dipakai sebagai input awal untuk pipeline cleaning yang sudah ada.
"""

from __future__ import annotations

import argparse
import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Sequence


DEFAULT_INPUT = "darsi_dirty.json"
DEFAULT_OUTPUT = "darsi_dirty.db"


PRIMARY_KEYS = {
    "pasien": "id_pasien",
    "kamar": "no_kamar",
    "rawat_inap": "id_rawat",
    "tagihan": "id_tagihan",
    "klaim_asuransi": "id_klaim",
    "detail_tindakan": "id",
    "detail_obat": "id",
    "tarif_layanan": "id_tarif",
    "biaya_operasional": "id",
}


def build_parser() -> argparse.ArgumentParser:
    """Membuat parser argumen CLI.

    Returns:
        argparse.ArgumentParser: Parser untuk membaca input dan output file.
    """
    parser = argparse.ArgumentParser(
        description="Konversi JSON dirty DARSI menjadi SQLite3",
    )
    parser.add_argument(
        "--input",
        default=DEFAULT_INPUT,
        help=f"Path file JSON sumber (default: {DEFAULT_INPUT})",
    )
    parser.add_argument(
        "--output",
        default=DEFAULT_OUTPUT,
        help=f"Path file SQLite3 output (default: {DEFAULT_OUTPUT})",
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Timpa file output jika sudah ada",
    )
    return parser


def load_payload(path: Path) -> Dict[str, Any]:
    """Membaca payload JSON dari file.

    Args:
        path: Lokasi file JSON.

    Returns:
        Dict[str, Any]: Data JSON yang sudah dimuat.

    Raises:
        FileNotFoundError: Jika file tidak ada.
        ValueError: Jika struktur JSON tidak valid.
    """
    if not path.exists():
        raise FileNotFoundError(f"File JSON tidak ditemukan: {path}")

    with path.open("r", encoding="utf-8") as file_handle:
        payload = json.load(file_handle)

    if not isinstance(payload, dict):
        raise ValueError("Struktur JSON harus berupa object root.")
    if "tables" not in payload or not isinstance(payload["tables"], dict):
        raise ValueError("JSON harus punya key 'tables' berisi object tabel.")

    return payload


def collect_columns(rows: Sequence[Dict[str, Any]]) -> List[str]:
    """Mengumpulkan daftar kolom dari seluruh baris tabel.

    Args:
        rows: Daftar record tabel.

    Returns:
        List[str]: Kolom unik dalam urutan kemunculan.
    """
    columns: List[str] = []
    for row in rows:
        for key in row.keys():
            if key not in columns:
                columns.append(key)
    return columns


def to_sql_value(value: Any) -> Any:
    """Mengubah nilai JSON ke bentuk yang aman untuk SQLite.

    Args:
        value: Nilai asli dari JSON.

    Returns:
        Any: Nilai yang siap disimpan di SQLite.
    """
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return value


def create_table_sql(table_name: str, columns: Sequence[str]) -> str:
    """Membuat SQL untuk tabel SQLite.

    Args:
        table_name: Nama tabel.
        columns: Daftar kolom tabel.

    Returns:
        str: Statement CREATE TABLE.
    """
    column_defs = []
    primary_key = PRIMARY_KEYS.get(table_name)

    for column in columns:
        if column == primary_key:
            column_defs.append(f'"{column}" TEXT PRIMARY KEY')
        else:
            column_defs.append(f'"{column}" TEXT')

    if not column_defs:
        column_defs.append('"id" INTEGER PRIMARY KEY AUTOINCREMENT')

    return f'CREATE TABLE IF NOT EXISTS "{table_name}" ({", ".join(column_defs)})'


def import_table(conn: sqlite3.Connection, table_name: str, rows: Sequence[Dict[str, Any]]) -> int:
    """Membuat dan mengisi satu tabel SQLite.

    Args:
        conn: Koneksi SQLite aktif.
        table_name: Nama tabel tujuan.
        rows: Daftar baris JSON untuk tabel tersebut.

    Returns:
        int: Jumlah baris yang berhasil diinsert.
    """
    if not rows:
        conn.execute(f'DROP TABLE IF EXISTS "{table_name}"')
        conn.execute(f'CREATE TABLE "{table_name}" ("id" INTEGER PRIMARY KEY AUTOINCREMENT)')
        return 0

    columns = collect_columns(rows)
    conn.execute(f'DROP TABLE IF EXISTS "{table_name}"')
    conn.execute(create_table_sql(table_name, columns))

    placeholders = ", ".join(["?"] * len(columns))
    quoted_columns = ", ".join(f'"{column}"' for column in columns)
    insert_sql = f'INSERT INTO "{table_name}" ({quoted_columns}) VALUES ({placeholders})'

    inserted = 0
    for row in rows:
        values = [to_sql_value(row.get(column)) for column in columns]
        conn.execute(insert_sql, values)
        inserted += 1
    return inserted


def convert_json_to_sqlite(input_path: Path, output_path: Path, replace: bool = False) -> Dict[str, int]:
    """Mengonversi JSON dirty ke SQLite3.

    Args:
        input_path: File JSON sumber.
        output_path: File SQLite output.
        replace: Jika True, file output lama akan ditimpa.

    Returns:
        Dict[str, int]: Statistik jumlah baris per tabel.

    Raises:
        FileExistsError: Jika output sudah ada dan replace=False.
    """
    if output_path.exists():
        if not replace:
            raise FileExistsError(
                f"File output sudah ada: {output_path}. Gunakan --replace jika ingin menimpa."
            )
        output_path.unlink()

    payload = load_payload(input_path)
    tables = payload["tables"]

    output_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(output_path)
    try:
        stats: Dict[str, int] = {}
        for table_name, rows in tables.items():
            if not isinstance(rows, list):
                raise ValueError(f"Tabel '{table_name}' harus berupa list baris.")
            stats[table_name] = import_table(conn, table_name, rows)
        conn.commit()
        return stats
    finally:
        conn.close()


def main() -> int:
    """Entry point CLI untuk konversi JSON ke SQLite3.

    Returns:
        int: Kode keluar proses. 0 berarti sukses.
    """
    parser = build_parser()
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    stats = convert_json_to_sqlite(input_path, output_path, replace=args.replace)

    print(f"SQLite dirty berhasil dibuat: {output_path}")
    for table_name, count in stats.items():
        print(f"- {table_name}: {count} baris")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
