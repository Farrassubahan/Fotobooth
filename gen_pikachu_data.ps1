$files = @('pikacu1.png','pikacu2.png','pikacu3.png','pikacu4.png')
$output = "// Auto-generated Pikachu image data (base64 embedded)`nconst PIKACHU_IMAGES = {`n"
foreach ($f in $files) {
    $path = Join-Path "c:\Users\farras\Downloads\fotobooth" $f
    $bytes = [IO.File]::ReadAllBytes($path)
    $b64 = [Convert]::ToBase64String($bytes)
    $key = $f -replace '\.png$',''
    $output += "    '$key': 'data:image/png;base64,$b64',`n"
}
$output += "};`n"
[IO.File]::WriteAllText("c:\Users\farras\Downloads\fotobooth\pikachu_data.js", $output)
Write-Host "Done! File size: $((Get-Item 'c:\Users\farras\Downloads\fotobooth\pikachu_data.js').Length) bytes"
