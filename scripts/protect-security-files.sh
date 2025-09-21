#!/usr/bin/env bash

# Security File Protection System
# This script protects critical security files from accidental modification/deletion

# Determine the repository root dynamically
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(cd "$SCRIPT_DIR/../../SOURCE/scheduling-app" && pwd)}"
SECURITY_GUARD_DIR="$REPO_ROOT/.security-guard"
BACKUP_DIR="$SECURITY_GUARD_DIR/backups"
CHECKSUMS_FILE="$SECURITY_GUARD_DIR/security-checksums.txt"

# Critical security files to protect
PROTECTED_FILES=(
    ".git/hooks/pre-commit"
    ".git/hooks/pre-push"
    "package.json"
    ".husky/pre-commit"
    ".husky/pre-push"
    ".github/workflows/*.yml"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 Security File Protection System${NC}"
echo "=================================================="

# Create security guard directory structure
mkdir -p "$BACKUP_DIR"
mkdir -p "$SECURITY_GUARD_DIR/logs"

# Function to create checksums for protected files
create_checksums() {
    echo -e "${YELLOW}📝 Creating security file checksums...${NC}"
    > "$CHECKSUMS_FILE"

    cd "$REPO_ROOT"
    for file_pattern in "${PROTECTED_FILES[@]}"; do
        for file in $file_pattern; do
            if [[ -f "$file" ]]; then
                # Calculate MD5 checksum
                if command -v md5sum >/dev/null 2>&1; then
                    checksum=$(md5sum "$file" | cut -d' ' -f1)
                elif command -v md5 >/dev/null 2>&1; then
                    checksum=$(md5 -q "$file")
                else
                    checksum=$(shasum -a 256 "$file" | cut -d' ' -f1)
                fi
                echo "$checksum:$file" >> "$CHECKSUMS_FILE"
                echo "  ✓ $file"
            fi
        done
    done
    echo -e "${GREEN}✅ Checksums created${NC}"
}

# Function to backup protected files
backup_files() {
    echo -e "${YELLOW}💾 Creating backups of protected files...${NC}"
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_subdir="$BACKUP_DIR/$timestamp"
    mkdir -p "$backup_subdir"

    cd "$REPO_ROOT"
    for file_pattern in "${PROTECTED_FILES[@]}"; do
        for file in $file_pattern; do
            if [[ -f "$file" ]]; then
                # Create directory structure in backup
                backup_file_dir="$backup_subdir/$(dirname "$file")"
                mkdir -p "$backup_file_dir"
                cp "$file" "$backup_subdir/$file"
                echo "  ✓ Backed up: $file"
            fi
        done
    done

    # Keep only last 10 backups
    ls -dt "$BACKUP_DIR"/*/ | tail -n +11 | xargs rm -rf 2>/dev/null
    echo -e "${GREEN}✅ Files backed up to: $backup_subdir${NC}"
}

# Function to verify file integrity
verify_integrity() {
    echo -e "${YELLOW}🔍 Verifying file integrity...${NC}"

    if [[ ! -f "$CHECKSUMS_FILE" ]]; then
        echo -e "${RED}❌ No checksums file found. Run with --init first.${NC}"
        return 1
    fi

    integrity_ok=true
    cd "$REPO_ROOT"

    while IFS=':' read -r stored_checksum file_path; do
        if [[ -f "$file_path" ]]; then
            # Calculate current checksum
            if command -v md5sum >/dev/null 2>&1; then
                current_checksum=$(md5sum "$file_path" | cut -d' ' -f1)
            elif command -v md5 >/dev/null 2>&1; then
                current_checksum=$(md5 -q "$file_path")
            else
                current_checksum=$(shasum -a 256 "$file_path" | cut -d' ' -f1)
            fi

            if [[ "$stored_checksum" == "$current_checksum" ]]; then
                echo -e "  ${GREEN}✓${NC} $file_path"
            else
                echo -e "  ${RED}❌ MODIFIED: $file_path${NC}"
                integrity_ok=false
            fi
        else
            echo -e "  ${RED}❌ MISSING: $file_path${NC}"
            integrity_ok=false
        fi
    done < "$CHECKSUMS_FILE"

    if $integrity_ok; then
        echo -e "${GREEN}✅ All security files intact${NC}"
        return 0
    else
        echo -e "${RED}🚨 SECURITY ALERT: Protected files have been modified!${NC}"
        return 1
    fi
}

# Function to restore from backup
restore_files() {
    echo -e "${YELLOW}🔄 Restoring files from backup...${NC}"

    # Find latest backup
    latest_backup=$(ls -dt "$BACKUP_DIR"/*/ 2>/dev/null | head -1)

    if [[ -z "$latest_backup" ]]; then
        echo -e "${RED}❌ No backups found${NC}"
        return 1
    fi

    echo "Restoring from: $latest_backup"
    cd "$REPO_ROOT"

    # Restore each protected file
    for file_pattern in "${PROTECTED_FILES[@]}"; do
        for file in $file_pattern; do
            backup_file="$latest_backup/$file"
            if [[ -f "$backup_file" ]]; then
                mkdir -p "$(dirname "$file")"
                cp "$backup_file" "$file"
                chmod +x "$file" 2>/dev/null  # Restore execute permissions for scripts
                echo "  ✓ Restored: $file"
            fi
        done
    done

    echo -e "${GREEN}✅ Files restored from backup${NC}"
}

# Function to set up monitoring
setup_monitoring() {
    echo -e "${YELLOW}🔍 Setting up file monitoring...${NC}"

    # Create file monitoring script
    cat > "$SECURITY_GUARD_DIR/monitor.sh" << 'EOF'
#!/usr/bin/env bash
# Automated security file monitoring

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/logs/monitor.log"

echo "$(date): Starting security file integrity check" >> "$LOG_FILE"

if ! "$SCRIPT_DIR/protect-security-files.sh" --verify; then
    echo "$(date): SECURITY ALERT - Protected files modified!" >> "$LOG_FILE"
    echo "🚨 SECURITY ALERT: Protected files have been modified!" >&2
    exit 1
fi

echo "$(date): All security files verified" >> "$LOG_FILE"
EOF

    chmod +x "$SECURITY_GUARD_DIR/monitor.sh"

    # Create git hook that runs monitoring
    cat > "$SECURITY_GUARD_DIR/git-hook-verifier.sh" << 'EOF'
#!/usr/bin/env bash
# Git hook to verify security file integrity

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run integrity check
if ! "$SCRIPT_DIR/monitor.sh"; then
    echo "🚨 Security files have been compromised!"
    echo "Run: .security-guard/protect-security-files.sh --restore"
    exit 1
fi
EOF

    chmod +x "$SECURITY_GUARD_DIR/git-hook-verifier.sh"

    echo -e "${GREEN}✅ Monitoring system configured${NC}"
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Security File Protection System - Protects critical security files"
    echo ""
    echo "Options:"
    echo "  --init      Initialize protection (create checksums and backups)"
    echo "  --verify    Verify file integrity against stored checksums"
    echo "  --backup    Create new backup of protected files"
    echo "  --restore   Restore files from latest backup"
    echo "  --monitor   Set up automated monitoring"
    echo "  --status    Show protection status"
    echo "  --help      Show this help message"
    echo ""
    echo "Protected files:"
    for file in "${PROTECTED_FILES[@]}"; do
        echo "  - $file"
    done
}

# Function to show status
show_status() {
    echo -e "${BLUE}🔒 Security File Protection Status${NC}"
    echo "=================================================="

    # Check if initialized
    if [[ -f "$CHECKSUMS_FILE" ]]; then
        echo -e "${GREEN}✓${NC} Protection initialized"

        # Count protected files
        protected_count=$(wc -l < "$CHECKSUMS_FILE")
        echo -e "${GREEN}✓${NC} Protecting $protected_count files"

        # Check backup count
        backup_count=$(ls -d "$BACKUP_DIR"/*/ 2>/dev/null | wc -l)
        echo -e "${GREEN}✓${NC} $backup_count backups available"

        # Show latest backup
        latest_backup=$(ls -dt "$BACKUP_DIR"/*/ 2>/dev/null | head -1)
        if [[ -n "$latest_backup" ]]; then
            backup_date=$(basename "$latest_backup")
            echo -e "${GREEN}✓${NC} Latest backup: $backup_date"
        fi

        # Verify current integrity
        if verify_integrity >/dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} All files verified"
        else
            echo -e "${RED}❌${NC} Files modified - run --verify for details"
        fi
    else
        echo -e "${RED}❌${NC} Protection not initialized - run --init"
    fi
}

# Main logic
case "${1:-}" in
    --init)
        backup_files
        create_checksums
        setup_monitoring
        echo -e "${GREEN}🎉 Security file protection initialized!${NC}"
        ;;
    --verify)
        verify_integrity
        ;;
    --backup)
        backup_files
        ;;
    --restore)
        restore_files
        ;;
    --monitor)
        setup_monitoring
        ;;
    --status)
        show_status
        ;;
    --help|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        show_help
        exit 1
        ;;
esac