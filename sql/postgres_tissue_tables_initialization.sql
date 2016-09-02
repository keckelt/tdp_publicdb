-- Table: tissue.targid_tissue

-- DROP TABLE tissue.targid_tissue;

CREATE TABLE tissue.targid_tissue
(
  tissuename text NOT NULL,
  species text,
  organ text,
  tumortype text,
  gender text,
  CONSTRAINT targid_tissue_pkey PRIMARY KEY (tissuename)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tissue.targid_tissue
  OWNER TO postgres;


-- Table: tissue.targid_copynumber

-- DROP TABLE tissue.targid_copynumber;

CREATE TABLE tissue.targid_copynumber
(
  ensg text NOT NULL,
  tissuename text NOT NULL,
  log2relativecopynumber real,
  relativecopynumber real,
  copynumberclass smallint,
  totalabscopynumber real,
  CONSTRAINT targid_copynumber_pkey PRIMARY KEY (ensg, tissuename)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tissue.targid_copynumber
  OWNER TO postgres;

-- Index: tissue.targid_copynumber_tissuename_idx

-- DROP INDEX tissue.targid_copynumber_tissuename_idx;

CREATE INDEX targid_copynumber_tissuename_idx
  ON tissue.targid_copynumber
  USING btree
  (tissuename COLLATE pg_catalog."default");

-- Index: tissue.targid_copynumber_log2relativecopynumber_idx

-- DROP INDEX tissue.targid_copynumber_log2relativecopynumber_idx;

CREATE INDEX targid_copynumber_log2relativecopynumber_idx
  ON tissue.targid_copynumber
  USING btree
  (log2relativecopynumber);





-- Table: tissue.targid_expression

-- DROP TABLE tissue.targid_expression;

CREATE TABLE tissue.targid_expression
(
  ensg text NOT NULL,
  tissuename text NOT NULL,
  log2fpkm real,
  log2tpm real,
  counts integer,
  CONSTRAINT targid_expression_pkey PRIMARY KEY (ensg, tissuename)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tissue.targid_expression
  OWNER TO postgres;

-- Index: tissue.targid_expression_tissuename_idx

-- DROP INDEX tissue.targid_expression_tissuename_idx;

CREATE INDEX targid_expression_tissuename_idx
  ON tissue.targid_expression
  USING btree
  (tissuename COLLATE pg_catalog."default");

-- Index: tissue.targid_expression_log2tpm_idx

-- DROP INDEX tissue.targid_expression_log2tpm_idx;

CREATE INDEX targid_expression_log2tpm_idx
  ON tissue.targid_expression
  USING btree
  (log2tpm);





-- Table: tissue.targid_mutation

-- DROP TABLE tissue.targid_mutation;

CREATE TABLE tissue.targid_mutation
(
  ensg text NOT NULL,
  tissuename text NOT NULL,
  dna_mutated boolean,
  dnamutation text,
  aa_mutated boolean,
  aamutation text,
  zygosity real,
  exonscomplete real,
  confirmeddetail boolean,
  numsources smallint,
  CONSTRAINT targid_mutation_pkey PRIMARY KEY (ensg, tissuename)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tissue.targid_mutation
  OWNER TO postgres;

-- Index: tissue.targid_mutation_tissuename_idx

-- DROP INDEX tissue.targid_mutation_tissuename_idx;

CREATE INDEX targid_mutation_tissuename_idx
  ON tissue.targid_mutation
  USING btree
  (tissuename COLLATE pg_catalog."default");



-- View: tissue.targid_data

-- DROP VIEW tissue.targid_data;

CREATE OR REPLACE VIEW tissue.targid_data AS
 SELECT omics.ensg,
    omics.tissuename,
    max(omics.copynumberclass) AS copynumberclass,
    max(omics.log2tpm) AS log2tpm,
    every(omics.dna_mutated) AS dna_mutated
   FROM ( SELECT targid_copynumber.ensg,
            targid_copynumber.tissuename,
            targid_copynumber.copynumberclass,
            NULL::real AS log2tpm,
            NULL::boolean AS dna_mutated
           FROM tissue.targid_copynumber
        UNION ALL
         SELECT targid_expression.ensg,
            targid_expression.tissuename,
            NULL::smallint AS copynumberclass,
            targid_expression.log2tpm,
            NULL::boolean AS dna_mutated
           FROM tissue.targid_expression
        UNION ALL
         SELECT targid_mutation.ensg,
            targid_mutation.tissuename,
            NULL::smallint AS copynumberclass,
            NULL::real AS log2tpm,
            targid_mutation.dna_mutated
           FROM tissue.targid_mutation) omics
  GROUP BY omics.ensg, omics.tissuename;

ALTER TABLE tissue.targid_data
  OWNER TO postgres;
