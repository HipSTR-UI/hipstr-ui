export const parameters = [
  {
    name: "def-stutter-model",
    description:
      "For each locus, use a stutter model with PGEOM=0.9 and UP=DOWN=0.05 for in-frame artifacts and PGEOM=0.9 and UP=DOWN=0.01 for out-of-frame artifacts. Why? You have too few samples for stutter estimation and don't have stutter models",
    type: "boolean",
  },
  {
    name: "min-reads",
    description: "Minimum total reads required to genotype a locus (Default = 100). Why? Refer to the discussion above",
    type: "number",
  },
  {
    name: "viz-out",
    description:
      "Output a file of each locus' alignments for visualization with VizAln or VizAlnPdf. Why? You want to visualize or inspect the STR genotypes",
    type: "text",
  },
  // {
  //   name: "log",
  //   description: "Output the log information to the provided file (Default = Standard error)",
  //   type: "text",
  // },
  {
    name: "haploid-chrs",
    description:
      "Comma separated list of chromosomes to treat as haploid (Default = all diploid). Why? You're analyzing a haploid chromosome like chrY",
    type: "text",
  },
  {
    name: "no-rmdup",
    description:
      "Don't remove PCR duplicates. By default, they'll be removed. Why? Your sequencing data is for PCR-amplified regions",
    type: "boolean",
  },
  {
    name: "use-unpaired",
    description:
      "Use unpaired reads when genotyping (Default = False). Why? Your sequencing data only contains single-ended reads",
    type: "boolean",
  },
  {
    name: "snp-vcf",
    description:
      "Bgzipped input VCF file containing phased SNP genotypes for the samples to be genotyped. These SNPs will be used to physically phase STRs. Why? You have available phased SNP genotypes",
    type: "text",
  },
  {
    name: "bam-samps",
    description:
      "Comma separated list of samples in same order as BAM files. Assign each read the sample corresponding to its file. By default, each read must have an RG tag and and the sample is determined from the SM field. Why? Your BAM file RG tags don't have an SM field",
    type: "text",
  },
  {
    name: "bam-libs",
    description:
      "Comma separated list of libraries in same order as BAM files. Assign each read the library corresponding to its file. By default, each read must have an RG tag and and the library is determined from the LB field. NOTE: This option is required when --bam-samps has been specified. Why? Your BAM file RG tags don't have an LB tag",
    type: "text",
  },
  {
    name: "lib-field",
    description:
      "Read group field used to assign each read a library. By default, the library is determined from the LB field associated with RG. Why? Your BAM file RG tags don't have an LB tag and you want to use a different tag instead (e.g. SM)",
    type: "text",
  },
  {
    name: "output-filters",
    description: "Write why individual calls were filtered to the VCF (Default = False)",
    type: "boolean",
  },
];
