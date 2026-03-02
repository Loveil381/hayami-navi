﻿$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$srcDir = "src"
$outDir = "."
$partialsDir = "$srcDir/partials"
$pagesDir = "$srcDir/pages"
$cssDir = "$srcDir/css"
$jsDir = "$srcDir/js"

$headTemplate = Get-Content "$partialsDir/head.html" -Raw -Encoding UTF8
$headerTemplate = Get-Content "$partialsDir/header.html" -Raw -Encoding UTF8
$footerTemplate = Get-Content "$partialsDir/footer.html" -Raw -Encoding UTF8
$cssContent = Get-Content "$cssDir/style.css" -Raw -Encoding UTF8
$jsContent = Get-Content "$jsDir/utils.js" -Raw -Encoding UTF8

function Get-Wareki($year) {
    if ($year -ge 2019) { return @{ era = "$([char]0x4EE4)$([char]0x548C)"; eraYear = $year - 2018; cls = "era-reiwa" } }
    if ($year -ge 1989) { return @{ era = "$([char]0x5E73)$([char]0x6210)"; eraYear = $year - 1988; cls = "era-heisei" } }
    if ($year -ge 1926) { return @{ era = "$([char]0x662D)$([char]0x548C)"; eraYear = $year - 1925; cls = "era-showa" } }
    if ($year -ge 1912) { return @{ era = "$([char]0x5927)$([char]0x6B63)"; eraYear = $year - 1911; cls = "era-taisho" } }
    if ($year -ge 1868) { return @{ era = "$([char]0x660E)$([char]0x6CBB)"; eraYear = $year - 1867; cls = "era-meiji" } }
    return @{ era = ""; eraYear = $year; cls = "" }
}

function Format-Wareki($w) {
    if (-not $w.era) { return "$($w.eraYear)$([char]0x5E74)" }
    $yearStr = if ($w.eraYear -eq 1) { "$([char]0x5143)" } else { $w.eraYear }
    return "$($w.era)$yearStr$([char]0x5E74)"
}

function Format-Wareki-Html($year) {
    $w = Get-Wareki $year
    if (-not $w.era) { return "" }
    $yearStr = if ($w.eraYear -eq 1) { "$([char]0x5143)" } else { $w.eraYear }
    return "<span class=`"$($w.cls)`">$($w.era)$yearStr$([char]0x5E74)</span>"
}

function Get-EtoIndex($year) {
    return ($year + 8) % 12
}

$ETO_LIST = @("$([char]0x5B50)", "$([char]0x4E11)", "$([char]0x5BC5)", "$([char]0x536F)", "$([char]0x8FB0)", "$([char]0x5DF3)", "$([char]0x5348)", "$([char]0x672A)", "$([char]0x7533)", "$([char]0x9149)", "$([char]0x620C)", "$([char]0x4EA5)")
$ETO_READING = @("$([char]0x306D)", "$([char]0x3046)$([char]0x3057)", "$([char]0x3068)$([char]0x3089)", "$([char]0x3046)", "$([char]0x305F)$([char]0x3064)", "$([char]0x307F)", "$([char]0x3046)$([char]0x307E)", "$([char]0x3072)$([char]0x3064)$([char]0x3058)", "$([char]0x3055)$([char]0x308B)", "$([char]0x3068)$([char]0x308A)", "$([char]0x3044)$([char]0x306C)", "$([char]0x3044)")
$ETO_ANIMAL = @("🐭", "🐮", "🐯", "🐰", "🐲", "🐍", "🐴", "🐏", "🐵", "🐔", "🐶", "🐗")
$ETO_TRAIT = @(
    "$([char]0x793E)$([char]0x4EA4)$([char]0x7684)$([char]0x3067)$([char]0x6A5F)$([char]0x8EE2)$([char]0x304C)$([char]0x5229)$([char]0x304F)",
    "$([char]0x52E4)$([char]0x52C9)$([char]0x3067)$([char]0x5FCD)$([char]0x8010)$([char]0x5F37)$([char]0x3044)",
    "$([char]0x52C7)$([char]0x6C17)$([char]0x3068)$([char]0x6C7A)$([char]0x65AD)$([char]0x529B)$([char]0x304C)$([char]0x3042)$([char]0x308B)",
    "$([char]0x6E29)$([char]0x548C)$([char]0x3067)$([char]0x512A)$([char]0x96C5)",
    "$([char]0x30A8)$([char]0x30CD)$([char]0x30EB)$([char]0x30AE)$([char]0x30C3)$([char]0x30B7)$([char]0x30E5)$([char]0x3067)$([char]0x91CE)$([char]0x5FC3)$([char]0x7684)",
    "$([char]0x77E5)$([char]0x6075)$([char]0x3068)$([char]0x6D1E)$([char]0x5BDF)$([char]0x529B)$([char]0x304C)$([char]0x3042)$([char]0x308B)",
    "$([char]0x660E)$([char]0x308B)$([char]0x304F)$([char]0x6D3B)$([char]0x767A)$([char]0x3067)$([char]0x884C)$([char]0x52D5)$([char]0x7684)",
    "$([char]0x512A)$([char]0x3057)$([char]0x304F)$([char]0x5275)$([char]0x9020)$([char]0x6027)$([char]0x304C)$([char]0x8C4A)$([char]0x304B)",
    "$([char]0x8CE2)$([char]0x304F)$([char]0x597D)$([char]0x5947)$([char]0x5FC3)$([char]0x65FA)$([char]0x76DB)",
    "$([char]0x51E0)$([char]0x5E33)$([char]0x9762)$([char]0x3067)$([char]0x89B3)$([char]0x5BDF)$([char]0x529B)$([char]0x306B)$([char]0x512A)$([char]0x308C)$([char]0x308B)",
    "$([char]0x5FE0)$([char]0x5B9F)$([char]0x3067)$([char]0x8AA0)$([char]0x5B9F)",
    "$([char]0x307E)$([char]0x3063)$([char]0x3059)$([char]0x3050)$([char]0x3067)$([char]0x60C5)$([char]0x306B)$([char]0x539A)$([char]0x3044)"
)
$ETO_ANIMAL_NAME = @("$([char]0x306D)$([char]0x305A)$([char]0x307F)", "$([char]0x3046)$([char]0x3057)", "$([char]0x3068)$([char]0x3089)", "$([char]0x3046)$([char]0x3055)$([char]0x304E)", "$([char]0x308A)$([char]0x3085)$([char]0x3046)", "$([char]0x3078)$([char]0x3073)", "$([char]0x3046)$([char]0x307E)", "$([char]0x3072)$([char]0x3064)$([char]0x3058)", "$([char]0x3055)$([char]0x308B)", "$([char]0x3068)$([char]0x308A)", "$([char]0x3044)$([char]0x306C)", "$([char]0x3044)$([char]0x306E)$([char]0x3057)$([char]0x3057)")
$CURRENT_YEAR = 2026

$headBlock = $headTemplate.Replace('<link rel="stylesheet" href="/css/style.css?v=1">', "<style>`n$cssContent`n    </style>")

Write-Host "Building pages..."

$pages = Get-ChildItem -Path $pagesDir -Filter "*.html"
foreach ($page in $pages) {
    Write-Host "  -> $($page.Name)"
    $content = Get-Content $page.FullName -Raw -Encoding UTF8
    
    $headerHtml = $headerTemplate
    $headerHtml = $headerHtml -replace '\{\{NAV_NENREI\}\}', $(if ($page.Name -eq 'nenrei.html') { 'subnav__link--active' } else { '' })
    $headerHtml = $headerHtml -replace '\{\{NAV_WAREKI\}\}', $(if ($page.Name -eq 'wareki.html') { 'subnav__link--active' } else { '' })
    $headerHtml = $headerHtml -replace '\{\{NAV_ETO\}\}', $(if ($page.Name -eq 'eto.html') { 'subnav__link--active' } else { '' })
    $headerHtml = $headerHtml -replace '\{\{NAV_GAKUREKI\}\}', $(if ($page.Name -eq 'gakureki.html') { 'subnav__link--active' } else { '' })
    $headerHtml = $headerHtml -replace '\{\{NAV_YAKUDOSHI\}\}', $(if ($page.Name -eq 'yakudoshi.html') { 'subnav__link--active' } else { '' })

    $content = $content.Replace("{{HEAD}}", $headBlock)
    $content = $content.Replace("{{HEADER}}", $headerHtml)
    $content = $content.Replace("{{FOOTER}}", $footerTemplate)
    $content = $content.Replace('<script src="/js/utils.js"></script>', "<script>`n$jsContent`n    </script>")

    if ($page.Name -eq "nenrei.html") {
        $tableRows = ""
        for ($year = $CURRENT_YEAR; $year -ge 1930; $year--) {
            $age = $CURRENT_YEAR - $year
            $w = Get-Wareki $year
            $etoIdx = Get-EtoIndex $year
            
            $warekiStr = Format-Wareki $w
            $cls = $w.cls
            $etoAnimal = $ETO_ANIMAL[$etoIdx]
            $etoKanji = $ETO_LIST[$etoIdx]
            $etoKana = $ETO_READING[$etoIdx]
            
            $tableRows += "                        <tr data-year=`"$year`">`n"
            $tableRows += "                            <td>$year$([char]0x5E74)</td>`n"
            $tableRows += "                            <td><span class=`"$cls`">$warekiStr</span></td>`n"
            $tableRows += "                            <td style=`"font-weight: 700;`">$age$([char]0x6B73)</td>`n"
            $tableRows += "                            <td>$etoAnimal $etoKanji$([char]0xFF08)$etoKana$([char]0xFF09)</td>`n"
            $tableRows += "                        </tr>`n"
        }
        $content = $content.Replace("{{AGE_TABLE_ROWS}}", $tableRows)
    }

    if ($page.Name -eq "wareki.html") {
        $tableRows = ""
        for ($year = $CURRENT_YEAR + 4; $year -ge 1926; $year--) {
            $age = $CURRENT_YEAR - $year
            $w = Get-Wareki $year
            
            $warekiStr = Format-Wareki $w
            $cls = $w.cls
            $ageStr = if ($age -lt 0) { "-" } elseif ($age -eq 0) { "0$([char]0x6B73) $([char]0xFF08)$([char]0x4ECA)$([char]0x5E74)$([char]0xFF09)" } else { "$age$([char]0x6B73)" }
            $isCurrent = if ($year -eq $CURRENT_YEAR) { ' class="highlight"' } else { "" }

            $tableRows += "                        <tr$isCurrent>`n"
            $tableRows += "                            <td>$year$([char]0x5E74)</td>`n"
            $tableRows += "                            <td><span class=`"$cls`" style=`"font-weight:700;`">$warekiStr</span></td>`n"
            $tableRows += "                            <td>$ageStr</td>`n"
            $tableRows += "                        </tr>`n"
        }
        $content = $content.Replace("{{WAREKI_TABLE_ROWS}}", $tableRows)
    }

    if ($page.Name -eq "eto.html") {
        # Eto Table
        $tableRows = ""
        for ($year = $CURRENT_YEAR; $year -ge 1924; $year--) {
            $idx = Get-EtoIndex $year
            $age = $CURRENT_YEAR - $year
            $etoAnimal = $ETO_ANIMAL[$idx]
            $etoKanji = $ETO_LIST[$idx]
            $etoKana = $ETO_READING[$idx]

            $tableRows += "                        <tr data-year=`"$year`">`n"
            $tableRows += "                            <td>$year$([char]0x5E74)</td>`n"
            $tableRows += "                            <td>$etoAnimal $etoKanji</td>`n"
            $tableRows += "                            <td>$etoKana$([char]0x3069)$([char]0x3057)</td>`n"
            $tableRows += "                            <td style=`"font-weight: 700;`">$age$([char]0x6B73)</td>`n"
            $tableRows += "                        </tr>`n"
        }
        $content = $content.Replace("{{ETO_TABLE_ROWS}}", $tableRows)

        # Eto Grid Cards
        $gridCards = ""
        for ($idx = 0; $idx -lt 12; $idx++) {
            $yearsHtml = ""
            $yearsCount = 0
            for ($year = $CURRENT_YEAR; $year -ge 1924 -and $yearsCount -lt 6; $year--) {
                if ((Get-EtoIndex $year) -eq $idx) {
                    $yearsHtml += "<span>$year</span>"
                    $yearsCount++
                }
            }

            $gridCards += "                <div class=`"zodiac-card`">`n"
            $gridCards += "                    <div class=`"zodiac-card__emoji`">$($ETO_ANIMAL[$idx])</div>`n"
            $gridCards += "                    <div class=`"zodiac-card__kanji`">$($ETO_LIST[$idx])</div>`n"
            $gridCards += "                    <div class=`"zodiac-card__reading`">$($ETO_READING[$idx])$([char]0x3069)$([char]0x3057)$([char]0xFF08)$($ETO_ANIMAL_NAME[$idx])$([char]0xFF09)</div>`n"
            $gridCards += "                    <div class=`"zodiac-card__years`">$yearsHtml</div>`n"
            $gridCards += "                </div>`n"
        }
        $content = $content.Replace("{{ZODIAC_GRID_CARDS}}", $gridCards)
    }

    if ($page.Name -eq "yakudoshi.html") {
        $tableRows = ""

        $yakuData = @(
            @{ gender = "male"; label = "$([char]0x7537)$([char]0x6027)"; honAge = 25 },
            @{ gender = "male"; label = "$([char]0x7537)$([char]0x6027)"; honAge = 42; isTaiyaku = $true },
            @{ gender = "male"; label = "$([char]0x7537)$([char]0x6027)"; honAge = 61 },
            @{ gender = "female"; label = "$([char]0x5973)$([char]0x6027)"; honAge = 19 },
            @{ gender = "female"; label = "$([char]0x5973)$([char]0x6027)"; honAge = 33; isTaiyaku = $true },
            @{ gender = "female"; label = "$([char]0x5973)$([char]0x6027)"; honAge = 37 },
            @{ gender = "female"; label = "$([char]0x5973)$([char]0x6027)"; honAge = 61 }
        )

        $currentGender = ""
        $lastGenderCount = 0

        foreach ($g in @('male', 'female')) {
            $genderRows = [System.Collections.ArrayList]::new()
            
            foreach ($y in $yakuData) {
                if ($y.gender -ne $g) { continue }
                
                $maeAge = $y.honAge - 1
                $honAge = $y.honAge
                $atoAge = $y.honAge + 1
                
                $genderRows.Add(@{ typeLabel = "$([char]0x524D)$([char]0x5384)"; kazoeAge = $maeAge; birthYear = $CURRENT_YEAR - $maeAge + 1; isHon = $false }) > $null
                $genderRows.Add(@{ typeLabel = "$([char]0x672C)$([char]0x5384)"; kazoeAge = $honAge; birthYear = $CURRENT_YEAR - $honAge + 1; isHon = $true }) > $null
                $genderRows.Add(@{ typeLabel = "$([char]0x5F8C)$([char]0x5384)"; kazoeAge = $atoAge; birthYear = $CURRENT_YEAR - $atoAge + 1; isHon = $false }) > $null
            }

            for ($i = 0; $i -lt $genderRows.Count; $i++) {
                $r = $genderRows[$i]
                $tableRows += "                        <tr>`n"
                
                if ($i -eq 0) {
                    $genderLabel = if ($g -eq 'male') { "$([char]0x7537)$([char]0x6027)" } else { "$([char]0x5973)$([char]0x6027)" }
                    $rowspan = $genderRows.Count
                    $tableRows += "                            <td rowspan=`"$rowspan`" style=`"font-weight:700; background:#f0f4f8; vertical-align:middle;`">$genderLabel</td>`n"
                }

                $hlClass = if ($r.isHon) { ' class="col-highlight"' } else { "" }
                $warekiSpan = Format-Wareki-Html $r.birthYear

                $tableRows += "                            <td$hlClass>$($r.typeLabel)</td>`n"
                $tableRows += "                            <td$hlClass>$($r.kazoeAge)$([char]0x6B73)</td>`n"
                $tableRows += "                            <td>$($r.birthYear)$([char]0x5E74)</td>`n"
                $tableRows += "                            <td>$warekiSpan</td>`n"
                $tableRows += "                        </tr>`n"
            }
        }
        $content = $content.Replace("{{YAKUDOSHI_TABLE_ROWS}}", $tableRows)
    }

    $outPath = Join-Path $outDir $page.Name
    Set-Content -Path $outPath -Value $content -Encoding UTF8
    Write-Host "     Saved: $outPath"
}

Write-Host "Build complete!"
