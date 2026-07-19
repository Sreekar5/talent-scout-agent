import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data")))
DATA_DIR.mkdir(parents=True, exist_ok=True)

MATCH_WEIGHT = float(os.getenv("MATCH_WEIGHT", "0.6"))
INTEREST_WEIGHT = float(os.getenv("INTEREST_WEIGHT", "0.4"))

MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "10"))