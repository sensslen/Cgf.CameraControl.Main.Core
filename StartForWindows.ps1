$ScriptPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

Add-Type -AssemblyName System.Windows.Forms

$ConfigFileBrowser = New-Object System.Windows.Forms.OpenFileDialog -Property @{ 
    Filter = 'Configuration (*.json)|*.json'
}

$dialogResult = $ConfigFileBrowser.ShowDialog()

if ($dialogResult -eq [System.Windows.Forms.DialogResult]::OK) {
    $fileName=$ConfigFileBrowser.FileName
    $command = "node `"$ScriptPath/dist/index.js`" --config `"$fileName`""
    Invoke-Expression $command
}
