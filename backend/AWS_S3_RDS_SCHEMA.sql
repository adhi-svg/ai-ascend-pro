-- S3 Document Upload Metadata Table
-- This table stores metadata about uploaded files in S3
-- The actual file content is stored in S3, only metadata is stored in RDS

CREATE TABLE IF NOT EXISTS documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(100) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  s3_key VARCHAR(500) NOT NULL UNIQUE,
  content_type VARCHAR(100),
  file_size BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Indexes for common queries
  INDEX idx_user_id (user_id),
  INDEX idx_document_type (document_type),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Optional: Create index for user + doc_type queries (e.g., get all Aadhaar docs for a user)
CREATE INDEX IF NOT EXISTS idx_user_doctype ON documents(user_id, document_type);
