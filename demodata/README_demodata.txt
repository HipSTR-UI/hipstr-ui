HipSTR-UI Example Data

This folder contains example files to test and validate the execution of HipSTR through the HipSTR-UI interface

1. Samples

This folder includes three example samples from the 1000 Genomes Project (public domain data)
Each sample is provided in CRAM format, along with its corresponding CRAI index

samples/
├── HG03304.final.cram
├── HG03304.final.cram.crai
├── HG03309.final.cram
├── HG03309.final.cram.crai
├── HG03311.final.cram
├── HG03311.final.cram.crai
├── HG03342.final.cram
├── HG03342.final.cram.crai
├── HG03354.final.cram
├── HG03354.final.cram.crai
├── HG03366.final.cram
├── HG03366.final.cram.crai
├── HG03436.final.cram
├── HG03436.final.cram.crai
├── HG03455.final.cram
├── HG03455.final.cram.crai
├── HG03479.final.cram
├── HG03479.final.cram.crai
├── HG03917.final.cram
└── HG03917.final.cram.crai

These are freely available reference samples used for testing and demonstration purposes only

2. regions.bed

This file contains the genomic coordinates of the STR markers captured and analyzed by HipSTR.
It defines which regions of the genome will be processed during alignment and genotyping.

regions.bed

3. Reference Genome (FASTA)

HipSTR requires a reference genome FASTA file to perform genotyping.
Due to its large size, it cannot be uploaded directly to this repository and must be downloaded manually.

Download link:
https://ftp.1000genomes.ebi.ac.uk/vol1/ftp/technical/reference/GRCh38_reference_genome/GRCh38_full_analysis_set_plus_decoy_hla.fa

After downloading, place the FASTA file inside this same folder
The corresponding .fai index file is already included in the repository

GRCh38_full_analysis_set_plus_decoy_hla.fa
GRCh38_full_analysis_set_plus_decoy_hla.fa.fai


4. Results
This folder will contain the output files generated after running HipSTR on the demo samples
They serve as reference examples for validating your own run

results/
├── hipstr_output_demo.vcf
├── hipstr_summary_demo.txt
└── hipstr_log_demo.txt

IMPORTANT

Once you have downloaded all example files, including the FASTA reference,
make sure to place all files in the same directory (path) before running HipSTR or HipSTR-UI.

Final structure example:

demodata/
├── samples/
├── results/
├── regions.bed
├── GRCh38_full_analysis_set_plus_decoy_hla.fa
└── GRCh38_full_analysis_set_plus_decoy_hla.fa.fai

Note:
These files are for demonstration and validation purposes only
They do not contain sensitive or identifiable genetic data
