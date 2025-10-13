# HipSTR UI

<img width="953" alt="image" src="https://github.com/user-attachments/assets/38db03b5-124e-4c80-afc4-9326a6e92395" />


HipSTR-UI is an easy-to-use graphical interface for the [HipSTR tool](https://github.com/tfwillems/HipSTR)

Comes with a pre-built HipSTR binary for Windows, macOS, and Linux. It was designed for **forensic analysts, students, and researchers** who need a simple way to run HipSTR or interpret its results without command-line skills

Built with Electron and Chakra UI.

# Quick Start

1. **Download** the installer for your system from the latest release for your operating system from the [Releases](https://github.com/jayala/hipstr-ui/releases) page
- **Windows:** hipstr-ui.Setup.exe
- **macOS Apple Silicon (M1/M2/M3):** hipstr-ui-darwin-arm64.zip
- **Ubuntu/Debian:** hipstr-ui_amd64.deb

Do not download “Source code (zip/tar.gz)” unless you want to build from source.

# How it works

HipSTR-UI operates in **two complementary modes**:

1. **Full pipeline execution**
    - Input: BAM/CRAM files, BED file (STR regions), and reference FASTA
    - HipSTR-UI runs HipSTR locally, producing:
        - a **VCF file** with genotyping results
        - a **log file** with detailed execution steps
    - Final genotypes and coverage are shown directly in the interface no manual calculations needed
2. **VCF interpretation & visualization**
    - Load an existing HipSTR VCF
    - HipSTR-UI parses the file and provides **interactive tables, allele plots, and exports**

# Features

- Runs **fully offline** all data stays on your computer
- Two modes: **Run HipSTR pipeline** or **Visualize existing VCFs**
- Interactive results table with filtering and export (CSV/Excel)
- Allele coverage plots and quality metrics
- Optional **ISFG nomenclature adjustments** for D19S433, D21S11, Penta D, and Penta E
- Log files to track execution and identify issues (e.g., ungenotyped loci)

## **Citation**

If you use HipSTR-UI, please cite:

- HipSTR-UI (manuscript in prep)
- Willems T, et al. HipSTR: Variant calling for STRs. *Nat Methods* 2017
