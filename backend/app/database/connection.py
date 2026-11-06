
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.engine import URL

# Project paths
BASE_DIR = Path(__file__).resolve().parents[2]

# Load environment variables
load_dotenv(BASE_DIR / ".env")

# Database credentials
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "meetmind_ai")

# Optional SSL certificate for TiDB
DB_SSL_CA = os.getenv("DB_SSL_CA", "").strip()

# Build database URL safely
DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
)

# SSL configuration
connect_args = {}

if DB_SSL_CA:
    ca_path = Path(DB_SSL_CA)

    if not ca_path.is_absolute():
        ca_path = BASE_DIR / ca_path

    if not ca_path.exists():
        raise FileNotFoundError(
            f"Database SSL certificate not found: {ca_path}"
        )

    connect_args = {
        "ssl": {
            "ca": str(ca_path)
        },
        "ssl_verify_cert": True,
        "ssl_verify_identity": True,
    }

# Create database engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=5,
    connect_args=connect_args,
    echo=False,
)

# Database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base class
Base = declarative_base()


# FastAPI database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Test database connection
def test_db_connection():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT DATABASE()")
        )
        return result.scalar()
