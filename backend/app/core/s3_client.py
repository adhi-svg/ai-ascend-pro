import boto3
from app.core.config import settings

# Boto3 will use the default credential provider chain:
# - Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
# - IAM instance profile/role (when running on EC2 or in this lab environment)
# - Other standard providers
# Do NOT hardcode credentials here.

s3_client = boto3.client(
    "s3",
    region_name=settings.AWS_REGION
)
