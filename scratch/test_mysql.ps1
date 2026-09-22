$candidates = @(
    'root', 'admin', 'password', '1234', '123456', '12345678', 'root123', 'root@123',
    'admin123', 'admin@123', '12345', 'mysql', 'mysql123', 'flowra', 'flowra123',
    'Joseph', 'joseph', 'Joseph@123', 'joseph@123', 'baron', 'Baron@123',
    'flowershop', 'flowershop123', 'root12', 'toor', 'pass', 'Password@123', 'Password123'
)

$mysql = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe'

foreach ($p in $candidates) {
    $out = & $mysql -u root "--password=$p" -e 'SHOW DATABASES;' 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Output "MATCH_FOUND:$p"
        exit 0
    }
}
Write-Output "NO_MATCH"
