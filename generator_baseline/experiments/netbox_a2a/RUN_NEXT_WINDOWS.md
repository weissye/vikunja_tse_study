# NetBox A-2-A V31 -- Windows execution sequence

Run from the V31 artifact root.

## 1. Validate

```powershell
Set-ExecutionPolicy -Scope Process Bypass

powershell -ExecutionPolicy Bypass -File .\experiments\netbox_a2a\Invoke-NetBox-A2A.ps1 `
  -Mode Validate
```

## 2. ProvengoComplex

```powershell
powershell -ExecutionPolicy Bypass -File .\experiments\netbox_a2a\Invoke-NetBox-A2A.ps1 `
  -Mode ProvengoComplex `
  -Seed 1 `
  -MaxLength 5000 `
  -InstancesPerEntity 5 `
  -InstancesPerAction 7 `
  -ResultsRoot .\results\netbox_a2a_v31
```

## 3. ProvengoBasic

```powershell
powershell -ExecutionPolicy Bypass -File .\experiments\netbox_a2a\Invoke-NetBox-A2A.ps1 `
  -Mode ProvengoBasic `
  -Seed 1 `
  -MaxLength 5000 `
  -InstancesPerEntity 5 `
  -InstancesPerAction 7 `
  -ResultsRoot .\results\netbox_a2a_v31
```

## 4. EvoMaster

```powershell
powershell -ExecutionPolicy Bypass -File .\experiments\netbox_a2a\Invoke-NetBox-A2A.ps1 `
  -Mode EvoMaster `
  -EvoMasterJar "C:\FSETools\EvoMaster\evomaster.jar" `
  -EvoMasterTime 1h `
  -Seed 1 `
  -ResultsRoot .\results\netbox_a2a_v31
```

## 5. RESTler

```powershell
powershell -ExecutionPolicy Bypass -File .\experiments\netbox_a2a\Invoke-NetBox-A2A.ps1 `
  -Mode RESTler `
  -RestlerDll "C:\FSETools\RESTler\restler\Restler.dll" `
  -RestlerHours 1 `
  -Seed 1 `
  -ResultsRoot .\results\netbox_a2a_v31
```

## 6. Collect

```powershell
powershell -ExecutionPolicy Bypass -File .\experiments\netbox_a2a\Invoke-NetBox-A2A.ps1 `
  -Mode Collect `
  -ResultsRoot .\results\netbox_a2a_v31
```

Read `semantic_evaluation.json` and `a2a_summary.json`. The three fields to keep distinct are `native_tool_faults`, `sequence_confirmed_semantic_classes` (official), and `campaign_reachability_classes` (diagnostic only).
