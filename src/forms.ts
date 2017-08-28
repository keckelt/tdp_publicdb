/**
 * Created by sam on 06.03.2017.
 */

import {SPECIES_SESSION_KEY, getSelectedSpecies} from 'tdp_gene/src/common';
import {FORM_EXPRESSION_SUBTYPE_ID, FORM_COPYNUMBER_SUBTYPE_ID} from 'tdp_gene/src/forms';
import {FormElementType, IFormElement} from 'tdp_core/src/form';
import {cachedLazy} from 'tdp_core/src/cached';
import {gene, IDataSourceConfig, tissue, cellline, dataSources, dataTypes, dataSubtypes} from './config';
import {listNamedSetsAsOptions} from 'tdp_core/src/storage';
import {previewFilterHint} from 'tdp_gene/src/utils';
import {getTDPData, getTDPLookupUrl} from 'tdp_core/src/rest';

/**
 * List of ids for parameter form elements
 * Reuse this ids and activate the `useSession` option for form elements to have the same selectedIndex between different views
 */
export class ParameterFormIds {
  static SPECIES = SPECIES_SESSION_KEY; // used as db field! be careful when renaming
  static DATA_SOURCE = 'data_source';
  static FILTER_BY = 'filter_by';
  static GENE_SYMBOL = 'gene_symbol';
  static CELLLINE_NAME = 'cellline_name';
  static TISSUE_NAME = 'tissue_name';
  static TUMOR_TYPE = 'tumor_type';
  static TISSUE_PANEL_NAME = 'tissue_panel_name';
  static ALTERATION_TYPE = 'alteration_type';
  static DATA_TYPE = 'data_type';
  static DATA_SUBTYPE = 'data_subtype';
  static DATA_HIERARCHICAL_SUBTYPE = 'hierarchical_data_subtype';
  static COPYNUMBER_SUBTYPE = FORM_COPYNUMBER_SUBTYPE_ID;
  static EXPRESSION_SUBTYPE = FORM_EXPRESSION_SUBTYPE_ID;
  static BIO_TYPE = 'bio_type';
  static AGGREGATION = 'aggregation';
  static COMPARISON_OPERATOR = 'comparison_operator';
  static COMPARISON_VALUE = 'comparison_value';
  static SCORE_FORCE_DATASET_SIZE = 'maxDirectFilterRows';
}

export const COMPARISON_OPERATORS = [
  {name: '&lt; less than', value: '<', data: '<'},
  {name: '&lt;= less equal', value: '<=', data: '<='},
  {name: 'not equal to', value: '<>', data: '<>'},
  {name: '&gt;= greater equal', value: '>=', data: '>='},
  {name: '&gt; greater than', value: '>', data: '>'}
];

export const MUTATION_AGGREGATION = [
  {name: 'Frequency', value: 'frequency', data: 'frequency'},
  {name: 'Count', value: 'count', data: 'count'}
];

export const NUMERIC_AGGREGATION = [
  {name: 'Average', value: 'avg', data: 'avg'},
  {name: 'Median', value: 'median', data: 'median'},
  {name: 'Min', value: 'min', data: 'min'},
  {name: 'Max', value: 'max', data: 'max'},
  {name: 'Frequency', value: 'frequency', data: 'frequency'},
  {name: 'Count', value: 'count', data: 'count'},
  {name: 'Boxplot', value: 'boxplot', data: 'boxplot'}
];


function buildPredefinedNamedSets(ds: IDataSourceConfig) {
  return getTDPData<{id: string}>(ds.db, `${ds.base}_panel`).then((panels: {id: string}[]) => panels.map((p) => p.id));
}

export const FORM_GENE_NAME = {
  type: FormElementType.SELECT2,
  label: 'Gene Symbol',
  id: ParameterFormIds.GENE_SYMBOL,
  attributes: {
    style: 'width:100%'
  },
  required: true,
  options: {
    optionsData: [],
    ajax: {
      url: getTDPLookupUrl(gene.db, `${gene.base}_items`),
      data: (params: any) => {
        return {
          column: 'symbol',
          species: getSelectedSpecies(),
          query: params.term === undefined ? '' : params.term,
          page: params.page === undefined ? 0 : params.page
        };
      }
    },
    templateResult: (item: any) => (item.id) ? `${item.text} <span class="ensg">${item.id}</span>` : item.text,
    templateSelection: (item: any) => (item.id) ? `${item.text} <span class="ensg">${item.id}</span>` : item.text
  },
  useSession: true
};

function generateNameLookup(d: IDataSourceConfig, field: string) {
  return {
    type: FormElementType.SELECT2,
    label: d.name,
    id: field,
    attributes: {
      style: 'width:100%'
    },
    required: true,
    options: {
      optionsData: [],
      ajax: {
        url: getTDPLookupUrl(d.db, `${d.base}_items`),
        data: (params: any) => {
          return {
            column: d.entityName,
            species: getSelectedSpecies(),
            query: params.term === undefined ? '' : params.term,
            page: params.page === undefined ? 0 : params.page
          };
        }
      }
    },
    useSession: true
  };
}

export const FORM_TISSUE_NAME = generateNameLookup(tissue, ParameterFormIds.TISSUE_NAME);
export const FORM_CELLLINE_NAME = generateNameLookup(cellline, ParameterFormIds.CELLLINE_NAME);

export const FORM_GENE_FILTER = {
  type: FormElementType.MAP,
  label: `Filter:`,
  id: 'filter',
  useSession: true,
  options: {
    sessionKeySuffix: '-gene',
    defaultSelection: false,
    uniqueKeys: true,
    badgeProvider: previewFilterHint(gene.db, 'gene', () => ({ filter_species: getSelectedSpecies()})),
    entries: [{
      name: 'Bio Type',
      value: 'biotype',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy('gene_biotypes', () => getTDPData<{text: string}>(gene.db, 'gene_unique_all', {
        column: 'biotype',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text)))
    }, {
      name: 'Strand',
      value: 'strand',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy('gene_strands', () => getTDPData<{text: string|number}>(gene.db, `gene_unique_all`, {
        column: 'strand',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => ({name: `${d.text === -1 ? 'reverse' : 'forward'} strand`, value: d.text}))))
    }, {
      name: 'Chromosome',
      value: 'chromosome',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy('gene_chromosome', () => getTDPData<{text: string|number}>(gene.db, `gene_unique_all`, {
        column: 'chromosome',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text.toString())))
    }, {
      name: 'Predefined Named Sets',
      value: 'panel',
      type: FormElementType.SELECT2,
      multiple: true,
      optionsData: cachedLazy('gene_predefined_namedsets', buildPredefinedNamedSets.bind(null, gene))
    }, {
      name: 'My Named Sets',
      value: 'namedset4ensg',
      type: FormElementType.SELECT2,
      multiple: true,
      optionsData: listNamedSetsAsOptions.bind(null, gene.idType)
    }, {
      name: 'Gene Symbol',
      value: 'ensg',
      type: FormElementType.SELECT2,
      multiple: true,
      ajax: {
        url: getTDPLookupUrl(gene.db, 'gene_items'),
        data: (params: any) => {
          return {
            column: 'symbol',
            species: getSelectedSpecies(),
            query: params.term === undefined ? '' : params.term,
            page: params.page === undefined ? 0 : params.page
          };
        }
      },
      templateResult: (item: any) => (item.id) ? `${item.text} <span class="ensg">${item.id}</span>` : item.text,
      templateSelection: (item: any) => (item.id) ? `${item.text} <span class="ensg">${item.id}</span>` : item.text
    }]
  }
};

function generateTissueSpecificFilter(d: IDataSourceConfig) {
  return [
    {
      name: 'Tumor Type adjacent',
      value: 'tumortype_adjacent',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy(d.base + '_tumortype_adjacent', () => getTDPData<{text: string}>(d.db, `${d.base}_unique_all`, {
        column: 'tumortype_adjacent',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text)))
    }, {
      name: 'Vendor name',
      value: 'vendorname',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy(d.base + '_vendorname', () => getTDPData<{text: string}>(d.db, `${d.base}_unique_all`, {
        column: 'vendorname',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text)))
    }, {
      name: 'Race',
      value: 'race',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy(d.base + '_race', () => getTDPData<{text: string}>(d.db, `${d.base}_unique_all`, {
        column: 'race',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text)))
    }, {
      name: 'Ethnicity',
      value: 'ethnicity',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy(d.base + '_ethnicity', () => getTDPData<{text: string}>(d.db, `${d.base}_unique_all`, {
        column: 'ethnicity',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text)))
    }, {
      name: 'Vital status',
      value: 'vital_status',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy(d.base + '_vital_status', () => getTDPData<{text: string|boolean}>(d.db, `${d.base}_unique_all`, {
        column: 'vital_status',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text === true? 'true' : 'false')))
    }
  ];
}

function generateCelllineSpecificFilter(d: IDataSourceConfig) {
  return [
    {
      name: 'Age at Surgery',
      value: 'age_at_surgery',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy(d.base + '_age_at_surgery', () => getTDPData<{text: string}>(d.db, `${d.base}_unique_all`, {
        column: 'age_at_surgery',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text)))
    }, {
      name: 'Growth Type',
      value: 'growth_type',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy(d.base + '_growth_type', () => getTDPData<{text: string}>(d.db, `${d.base}_unique_all`, {
        column: 'growth_type',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text)))
    }, {
      name: 'Histology Type',
      value: 'histology_type',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy(d.base + '_histology_type', () => getTDPData<{text: string}>(d.db, `${d.base}_unique_all`, {
        column: 'histology_type',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text)))
    }, {
      name: 'Metastatic Site',
      value: 'metastatic_site',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy(d.base + '_metastatic_site', () => getTDPData<{text: string}>(d.db, `${d.base}_unique_all`, {
        column: 'metastatic_site',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text)))
    }, {
      name: 'Morphology',
      value: 'morphology',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy(d.base + '_morphology', () => getTDPData<{text: string}>(d.db, `${d.base}_unique_all`, {
        column: 'morphology',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text)))
    }
  ];
}

function generateFilter(d: IDataSourceConfig) {
  let specificFilters = [];
  if(d === tissue) {
    specificFilters = generateTissueSpecificFilter(d);
  } else if(d === cellline) {
    specificFilters = generateCelllineSpecificFilter(d);
  }
  return {
    type: FormElementType.MAP,
    label: `Filter:`,
    id: 'filter',
    useSession: true,
    options: {
      sessionKeySuffix: '-' + d.base,
      badgeProvider: previewFilterHint(d.db, d.base, () => ({ filter_species: getSelectedSpecies()})),
      defaultSelection: false,
      uniqueKeys: true,
      entries: [{
        name: 'Tumor Type',
        value: 'tumortype',
        type: FormElementType.SELECT2,
        multiple: true,
        return: 'id',
        optionsData: cachedLazy(d.base + '_tumortypes', () => getTDPData<{text: string}>(d.db, `${d.base}_unique_all`, {
          column: 'tumortype',
          species: getSelectedSpecies()
        }).then((r) => r.map((d) => d.text)))
      }, {
        name: 'Organ',
        value: 'organ',
        type: FormElementType.SELECT2,
        multiple: true,
        return: 'id',
        optionsData: cachedLazy(d.base + '_organs', () => getTDPData<{text: string}>(d.db, `${d.base}_unique_all`, {
          column: 'organ',
          species: getSelectedSpecies()
        }).then((r) => r.map((d) => d.text)))
      }, {
        name: 'Gender',
        value: 'gender',
        type: FormElementType.SELECT2,
        multiple: true,
        return: 'id',
        optionsData: cachedLazy(d.base + '_gender', () => getTDPData<{text: string}>(d.db, `${d.base}_unique_all`, {
          column: 'gender',
          species: getSelectedSpecies()
        }).then((r) => r.map((d) => d.text)))
      },
      ...specificFilters,
      {
        name: 'Predefined Named Sets',
        value: 'panel',
        type: FormElementType.SELECT2,
        multiple: true,
        optionsData: cachedLazy(d.base + '_predefined_namedsets', buildPredefinedNamedSets.bind(null, d))
      }, {
        name: 'My Named Sets',
        value: 'namedset4' + d.entityName,
        type: FormElementType.SELECT2,
        multiple: true,
        optionsData: listNamedSetsAsOptions.bind(null, d.idType)
      }, {
        name: d.name,
        value: d.entityName,
        type: FormElementType.SELECT2,
        multiple: true,
        ajax: {
          url: getTDPLookupUrl(gene.db, `${d.base}_items`),
          data: (params: any) => {
            return {
              column: d.entityName,
              species: getSelectedSpecies(),
              query: params.term === undefined ? '' : params.term,
              page: params.page === undefined ? 0 : params.page
            };
          }
        }
      }]
    }
  };
}

export const FORM_DATA_SOURCE = {
  type: FormElementType.SELECT,
  label: 'Data Source',
  id: ParameterFormIds.DATA_SOURCE,
  required: true,
  options: {
    optionsData: dataSources.map((ds) => {
      return {name: ds.name, value: ds.name, data: ds};
    })
  },
  useSession: true
};

export const FORM_TISSUE_FILTER = generateFilter(tissue);
export const FORM_CELLLINE_FILTER = generateFilter(cellline);
export const FORM_TISSUE_OR_CELLLINE_FILTER = {
  type: FormElementType.MAP,
  label: `Filter:`,
  id: 'filter',
  useSession: true,
  dependsOn: [ParameterFormIds.DATA_SOURCE],
  options: {
    sessionKeySuffix: '-choose',
    defaultSelection: false,
    uniqueKeys: true,
    badgeProvider: (filter: any, dataSource: IFormElement) => {
      const value = dataSource.value;
      const data = value ? value.data : null;
      if (data === tissue || data === tissue.id) {
        return FORM_TISSUE_FILTER.options.badgeProvider(filter);
      } else if (data === cellline || data === cellline.id) {
        return FORM_CELLLINE_FILTER.options.badgeProvider(filter);
      }
      return '';
    },
    entries: (dataSource: IFormElement) => {
      const value = dataSource.value;
      const data = value ? value.data : null;
      if (data === tissue || data === tissue.id) {
        return FORM_TISSUE_FILTER.options.entries;
      } else if (data === cellline || data === cellline.id) {
        return FORM_CELLLINE_FILTER.options.entries;
      }
      return [];
    }
  }
};


export const FORM_DATA_HIERARCHICAL_SUBTYPE = {
  type: FormElementType.SELECT2_MULTIPLE,
  label: 'Data Type',
  id: ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE,
  attributes: {
    style: 'width:100%'
  },
  required: true,
  options: {
    data: dataTypes.map((ds) => {
      return {
        text: ds.name,
        children: ds.dataSubtypes.map((dss) => ({
          id: `${ds.id}-${dss.id}`,
          text: dss.name
        }))
      };
    })
  },
  useSession: true
};

export const FORM_DATA_HIERARCHICAL_SUBTYPE_AGGREGATED_SELECTION = {
  type: FormElementType.SELECT2,
  label: 'Data Type',
  id: ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE,
  attributes: {
    style: 'width:100%'
  },
  required: true,
  options: {
    data: dataTypes.map((ds) => {
      return {
        text: ds.name,
        //string types can't be aggregated
        children: ds.dataSubtypes.filter((d) => d.type !== dataSubtypes.string).map((dss) => ({
          id: `${ds.id}-${dss.id}`,
          text: dss.name
        }))
      };
    })
  },
  useSession: true
};
