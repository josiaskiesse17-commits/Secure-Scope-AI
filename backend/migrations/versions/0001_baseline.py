"""baseline

Revision ID: 0001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""


# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Baseline migration - no business tables yet
    # This allows us to verify migrations run from a clean database
    pass


def downgrade() -> None:
    pass