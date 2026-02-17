"""
PDF Processor - Extracts text from PDF files and saves as .txt files.

Usage:
    python pdf_processor.py --input <input_folder> --output <output_folder>

If no arguments are provided, defaults to:
    input:  ../input_PDF
    output: ../output_extract
"""

import argparse
import os
import sys
import json
from pathlib import Path

try:
    import PyPDF2
except ImportError:
    print("ERROR: PyPDF2 is not installed. Run: pip install PyPDF2", file=sys.stderr)
    sys.exit(1)


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a PDF file."""
    text_parts: list[str] = []
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page_num, page in enumerate(reader.pages, start=1):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(f"--- Page {page_num} ---\n{page_text}")
            else:
                text_parts.append(f"--- Page {page_num} ---\n[No extractable text]")
    return "\n\n".join(text_parts)


def process_pdfs(input_folder: str, output_folder: str) -> dict:
    """Process all PDFs in input_folder and write .txt files to output_folder."""
    input_path = Path(input_folder).resolve()
    output_path = Path(output_folder).resolve()

    if not input_path.exists():
        raise FileNotFoundError(f"Input folder does not exist: {input_path}")

    output_path.mkdir(parents=True, exist_ok=True)

    pdf_files = sorted(input_path.glob("*.pdf")) + sorted(input_path.glob("*.PDF"))
    # Remove duplicates (case-insensitive filesystems)
    seen = set()
    unique_pdfs = []
    for p in pdf_files:
        key = str(p).lower()
        if key not in seen:
            seen.add(key)
            unique_pdfs.append(p)
    pdf_files = unique_pdfs

    results = {
        "total": len(pdf_files),
        "success": 0,
        "failed": 0,
        "files": [],
    }

    if not pdf_files:
        print(json.dumps({"message": "No PDF files found in input folder.", **results}))
        return results

    print(f"Found {len(pdf_files)} PDF file(s) in {input_path}")

    for pdf_file in pdf_files:
        txt_filename = pdf_file.stem + ".txt"
        txt_path = output_path / txt_filename
        try:
            print(f"Processing: {pdf_file.name} ...", end=" ")
            text = extract_text_from_pdf(str(pdf_file))
            txt_path.write_text(text, encoding="utf-8")
            print("OK")
            results["success"] += 1
            results["files"].append(
                {"pdf": pdf_file.name, "txt": txt_filename, "status": "success"}
            )
        except Exception as e:
            print(f"FAILED: {e}")
            results["failed"] += 1
            results["files"].append(
                {"pdf": pdf_file.name, "txt": txt_filename, "status": "failed", "error": str(e)}
            )

    print(f"\nDone. Success: {results['success']}, Failed: {results['failed']}")
    return results


def main():
    parser = argparse.ArgumentParser(description="Extract text from PDF files.")
    parser.add_argument(
        "--input",
        type=str,
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "input_PDF"),
        help="Path to the input folder containing PDF files.",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "output_extract"),
        help="Path to the output folder for text extracts.",
    )
    args = parser.parse_args()

    try:
        results = process_pdfs(args.input, args.output)
        # Print final JSON summary for the backend to parse
        print("\n__RESULT_JSON__")
        print(json.dumps(results))
    except Exception as e:
        print(f"FATAL ERROR: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
