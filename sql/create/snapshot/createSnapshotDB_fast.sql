-- set variables
\set GENE_LIMIT 1000
\set TISSUE_LIMIT 500
\set CELLLINE_LIMIT 500
\set ORIGINAL_DBNAME ordino
\set SNAPSHOT_DBNAME ordino_dev
\set DB_USER ordino
\set DB_PASSWORD yRxTTPXFkiOMO89T9QMj
-----------------
-- ORDINO -------
-----------------
\connect :ORIGINAL_DBNAME;
--public
CREATE schema IF NOT EXISTS _public;
CREATE TABLE _public.targid_gene AS
	Select * from targid_gene LIMIT :GENE_LIMIT;
ALTER TABLE _public.targid_gene ADD CONSTRAINT pk_gene PRIMARY KEY(ensg);
CREATE TABLE _public.targid_geneassignment AS
	Select * from targid_geneassignment where ensg in (select ensg from _public.targid_gene) ;
ALTER TABLE _public.targid_geneassignment ADD CONSTRAINT pk_geneassignment PRIMARY KEY(ensg, genesetname);
CREATE TABLE _public.targid_geneset AS
	Select * from targid_geneset;
ALTER TABLE _public.targid_geneset ADD CONSTRAINT pk_geneset PRIMARY KEY(genesetname);
--tissue
CREATE schema IF NOT EXISTS _tissue;
CREATE TABLE _tissue.targid_tissue AS
	Select * from tissue.targid_tissue LIMIT :TISSUE_LIMIT ;
ALTER TABLE _tissue.targid_tissue ADD CONSTRAINT pk_tissue PRIMARY KEY(tissuename);
CREATE TABLE _tissue.targid_panel AS
	Select * from tissue.targid_panel ;
ALTER TABLE _tissue.targid_panel ADD CONSTRAINT pk_tissuepanel PRIMARY KEY(panel);
CREATE TABLE _tissue.targid_panelassignment AS
	Select * from tissue.targid_panelassignment where tissuename in (select tissuename from _tissue.targid_tissue) ;
ALTER TABLE _tissue.targid_panelassignment ADD CONSTRAINT pk_tissueassignment PRIMARY KEY(panel, tissuename);
CREATE TABLE _tissue.targid_mutation AS
	Select * from tissue.targid_mutation where tissuename in (select tissuename from _tissue.targid_tissue) and ensg in (select ensg from _public.targid_gene) ;
CREATE TABLE _tissue.targid_expression AS
	Select * from tissue.targid_expression where tissuename in (select tissuename from _tissue.targid_tissue) and ensg in (select ensg from _public.targid_gene) ;
CREATE TABLE _tissue.targid_copynumber AS
	Select * from tissue.targid_copynumber where tissuename in (select tissuename from _tissue.targid_tissue) and ensg in (select ensg from _public.targid_gene) ;
--cellline
CREATE schema IF NOT EXISTS _cellline;
CREATE TABLE _cellline.targid_cellline AS
	Select * from cellline.targid_cellline LIMIT :CELLLINE_LIMIT;
CREATE TABLE _cellline.targid_panel AS
	Select * from cellline.targid_panel;
CREATE TABLE _cellline.targid_panelassignment AS
	Select * from cellline.targid_panelassignment where celllinename in (select celllinename from _cellline.targid_cellline) ;
CREATE TABLE _cellline.targid_mutation AS
	Select * from cellline.targid_mutation where celllinename in (select celllinename from _cellline.targid_cellline) and ensg in (select ensg from _public.targid_gene) ;
CREATE TABLE _cellline.targid_expression AS
	Select * from cellline.targid_expression where celllinename in (select celllinename from _cellline.targid_cellline) and ensg in (select ensg from _public.targid_gene) ;
CREATE TABLE _cellline.targid_copynumber AS
	Select * from cellline.targid_copynumber where celllinename in (select celllinename from _cellline.targid_cellline) and ensg in (select ensg from _public.targid_gene) ;
-----------------
-- ORDINO_DEV ---
-----------------
-- connect to dev
\connect :SNAPSHOT_DBNAME;
-- add extension
CREATE schema IF NOT EXISTS public;
CREATE EXTENSION IF NOT EXISTS postgres_fdw;
-- connect to db
CREATE SERVER origServer FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'localhost', dbname :'ORIGINAL_DBNAME', port '5432');
CREATE USER MAPPING FOR ordino SERVER origServer OPTIONS(user :'DB_USER', password :'DB_PASSWORD');
-- import data
CREATE schema IF NOT EXISTS _public;
CREATE schema IF NOT EXISTS _tissue;
CREATE schema IF NOT EXISTS _cellline;
IMPORT FOREIGN SCHEMA _public FROM SERVER origServer INTO _public;
IMPORT FOREIGN SCHEMA _tissue FROM SERVER origServer INTO _tissue;
IMPORT FOREIGN SCHEMA _cellline FROM SERVER origServer INTO _cellline;
CREATE schema IF NOT EXISTS public;
CREATE TABLE public.targid_gene AS Select * from _public.targid_gene;
ALTER TABLE public.targid_gene ADD CONSTRAINT pk_gene PRIMARY KEY(ensg);
CREATE TABLE public.targid_geneassignment AS Select * from _public.targid_geneassignment;
ALTER TABLE public.targid_geneassignment ADD CONSTRAINT pk_geneassignment PRIMARY KEY(ensg, genesetname);
CREATE TABLE public.targid_geneset AS Select * from _public.targid_geneset;
ALTER TABLE public.targid_geneset ADD CONSTRAINT pk_geneset PRIMARY KEY(genesetname);
--tissue
CREATE schema IF NOT EXISTS tissue;
CREATE TABLE tissue.targid_tissue AS Select * from _tissue.targid_tissue;
ALTER TABLE tissue.targid_tissue ADD CONSTRAINT pk_tissue PRIMARY KEY(tissuename);
CREATE TABLE tissue.targid_panel AS Select * from _tissue.targid_panel;
ALTER TABLE tissue.targid_panel ADD CONSTRAINT pk_tissuepanel PRIMARY KEY(panel);
CREATE TABLE tissue.targid_panelassignment AS Select * from _tissue.targid_panelassignment;
ALTER TABLE tissue.targid_panelassignment ADD CONSTRAINT pk_tissueassignment PRIMARY KEY(panel, tissuename);
CREATE TABLE tissue.targid_mutation AS Select * from _tissue.targid_mutation;
ALTER TABLE tissue.targid_mutation ADD CONSTRAINT pk_mutation PRIMARY KEY(ensg, tissuename);
CREATE INDEX ON tissue.targid_mutation(tissuename);
CREATE TABLE tissue.targid_expression AS Select * from _tissue.targid_expression;
ALTER TABLE tissue.targid_expression ADD CONSTRAINT pk_expression PRIMARY KEY(ensg, tissuename);
CREATE INDEX ON tissue.targid_expression(tissuename);
CREATE TABLE tissue.targid_copynumber AS Select * from _tissue.targid_copynumber;
ALTER TABLE tissue.targid_copynumber ADD CONSTRAINT pk_copynumber PRIMARY KEY(ensg, tissuename);
CREATE INDEX ON tissue.targid_copynumber(tissuename);
--
CREATE OR REPLACE VIEW tissue.targid_data AS
 SELECT omics.ensg,
    omics.tissuename,
    max(omics.copynumberclass) AS copynumberclass,
    max(omics.tpm) AS tpm,
    every(omics.dna_mutated) AS dna_mutated,
    every(omics.aa_mutated) AS aa_mutated
   FROM ( SELECT targid_copynumber.ensg,
            targid_copynumber.tissuename,
            targid_copynumber.copynumberclass,
            NULL::double precision AS tpm,
            NULL::boolean AS dna_mutated,
            NULL::boolean AS aa_mutated
           FROM tissue.targid_copynumber
        UNION ALL
         SELECT targid_expression.ensg,
            targid_expression.tissuename,
            NULL::smallint AS copynumberclass,
            targid_expression.tpm,
            NULL::boolean AS dna_mutated,
            NULL::boolean AS aa_mutated
           FROM tissue.targid_expression
        UNION ALL
         SELECT targid_mutation.ensg,
            targid_mutation.tissuename,
            NULL::smallint AS copynumberclass,
            NULL::double precision AS tpm,
            targid_mutation.dna_mutated,
            targid_mutation.aa_mutated
           FROM tissue.targid_mutation) omics
  GROUP BY omics.ensg, omics.tissuename;
--cellline
CREATE schema IF NOT EXISTS cellline;
CREATE TABLE cellline.targid_cellline AS Select * from _cellline.targid_cellline;
ALTER TABLE cellline.targid_cellline ADD CONSTRAINT pk_cellline PRIMARY KEY(celllinename);
CREATE TABLE cellline.targid_panel AS Select * from _cellline.targid_panel;
ALTER TABLE cellline.targid_panel ADD CONSTRAINT pk_celllinepanel PRIMARY KEY(panel);
CREATE TABLE cellline.targid_panelassignment AS Select * from _cellline.targid_panelassignment;
ALTER TABLE cellline.targid_panelassignment ADD CONSTRAINT pk_celllineassignment PRIMARY KEY(panel, celllinename);
CREATE TABLE cellline.targid_mutation AS Select * from _cellline.targid_mutation;
ALTER TABLE cellline.targid_mutation ADD CONSTRAINT pk_mutation PRIMARY KEY(ensg, celllinename);
CREATE INDEX ON cellline.targid_mutation(celllinename);
CREATE TABLE cellline.targid_expression AS Select * from _cellline.targid_expression;
ALTER TABLE cellline.targid_expression ADD CONSTRAINT pk_expression PRIMARY KEY(ensg, celllinename);
CREATE INDEX ON cellline.targid_expression(celllinename);
CREATE TABLE cellline.targid_copynumber AS Select * from _cellline.targid_copynumber;
ALTER TABLE cellline.targid_copynumber ADD CONSTRAINT pk_copynumber PRIMARY KEY(ensg, celllinename);
CREATE INDEX ON cellline.targid_copynumber(celllinename);
--
CREATE OR REPLACE VIEW cellline.targid_data AS
 SELECT omics.ensg,
    omics.celllinename,
    max(omics.copynumberclass) AS copynumberclass,
    max(omics.tpm) AS tpm,
    every(omics.dna_mutated) AS dna_mutated,
    every(omics.aa_mutated) AS aa_mutated
   FROM ( SELECT targid_copynumber.ensg,
            targid_copynumber.celllinename,
            targid_copynumber.copynumberclass,
            NULL::double precision AS tpm,
            NULL::boolean AS dna_mutated,
            NULL::boolean AS aa_mutated
           FROM cellline.targid_copynumber
        UNION ALL
         SELECT targid_expression.ensg,
            targid_expression.celllinename,
            NULL::smallint AS copynumberclass,
            targid_expression.tpm,
            NULL::boolean AS dna_mutated,
            NULL::boolean AS aa_mutated
           FROM cellline.targid_expression
        UNION ALL
         SELECT targid_mutation.ensg,
            targid_mutation.celllinename,
            NULL::smallint AS copynumberclass,
            NULL::double precision AS tpm,
            targid_mutation.dna_mutated,
            targid_mutation.aa_mutated
           FROM cellline.targid_mutation) omics
  GROUP BY omics.ensg, omics.celllinename;
-- drop schemas
DROP SCHEMA _public CASCADE;
DROP SCHEMA _tissue CASCADE;
DROP SCHEMA _cellline CASCADE;
-- drop server
DROP SERVER origServer CASCADE;
DROP EXTENSION postgres_fdw;
-----------------
-- ORDINO -------
-----------------
-- connect to origServer
\connect :ORIGINAL_DBNAME;
-- drop schemas
DROP SCHEMA _public CASCADE;
DROP SCHEMA _tissue CASCADE;
DROP SCHEMA _cellline CASCADE;
