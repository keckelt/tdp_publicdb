/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

//register all extensions in the registry following the given pattern
module.exports = function (registry) {
  //registry.push('extension-type', 'extension-id', function() { return import('./src/extension_impl'); }, {});
  // generator-phovea:begin

  /// #if include('ordino')
  registry.push('ordinoStartMenuSubSection', 'celllinedb_genes_start', function () {
    return import('./src/menu/GeneSubSection');
  }, {
    name: 'Genes',
    viewId: 'celllinedb_start',
    idType: 'Ensembl',
    selection: 'none',
    description: 'Gene Sets',
    cssClass: 'gene-entry-point'
  });

  registry.push('ordinoStartMenuSubSection', 'bioinfodb_tissue_start', function () {
    return import('./src/menu/SampleSubSection');
  }, {
    name: 'Tissues',
    viewId: 'bioinfodb_tissue_start',
    idType: 'Tissue',
    selection: 'none',
    sampleType: 'Tissue',
    description: 'Tissue Panels',
    cssClass: 'tissue-entry-point'
  });

  registry.push('ordinoStartMenuSubSection', 'celllinedb_cellline_start', function () {
    return import('./src/menu/SampleSubSection');
  }, {
    name: 'Cell Lines',
    viewId: 'celllinedb_cellline',
    idType: 'Cellline',
    selection: 'none',
    description: 'Cell Line Panels',
    cssClass: 'cellline-entry-point'
  });
  /// #endif

  //gene views
  {
    registry.push('tdpView', 'celllinedb_start', function () {
      return import('./src/views/GeneList');
    }, {
      name: 'Genes',
      idtype: 'Ensembl',
      selection: 'none'
    });

    registry.push('tdpView', 'expressiontable', function () {
      return import('./src/views/DependentSampleTable');
    }, {
      name: 'Expression',
      factory: 'createExpressionTable',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Sample overview',
        order: 10
      }
    });

    registry.push('tdpView', 'copynumbertable', function () {
      return import('./src/views/DependentSampleTable');
    }, {
      name: 'Copy Number',
      factory: 'createCopyNumberTable',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Sample overview',
        order: 0
      }
    });

    registry.push('tdpView', 'mutationtable', function () {
      return import('./src/views/DependentSampleTable');
    }, {
      name: 'Mutation',
      factory: 'createMutationTable',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Sample overview',
        order: 20
      }
    });

    registry.push('tdpView', 'gene_generic_detail_view', function () {
      return import('./src/views/InfoTable.ts');
    }, {
      name: 'Database Info',
      factory: 'new GeneInfoTable',
      idtype: 'Ensembl',
      selection: 'multiple',
      group: {
        name: 'General',
        order: 0
      }
    });


    registry.push('tdpView', 'celllinedb_onco_print', function () {
      return import('./src/views/OncoPrint');
    }, {
      name: 'OncoPrint',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Sample overview',
        order: 40
      }
    });

    registry.push('tdpView', 'celllinedb_expression_vs_copynumber', function () {
      return import('./src/views/ExpressionVsCopyNumber');
    }, {
      name: 'Expression vs. Copy Number',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Visualization',
        order: 10
      }
    });

    registry.push('tdpView', 'celllinedb_co_expression', function () {
      return import('./src/views/CoExpression');
    }, {
      name: 'Co-Expression',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Visualization',
        order: 0
      }
    });

    registry.push('tdpView', 'gene_combined_lineup', function () {
      return import('./src/views/CombinedDependentSampleTable');
    }, {
      name: 'Combined View',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Sample overview',
        order: 40
      },
      filter: {
        species: 'human'
      }
    });

    /// #if include('uploader')
    registry.push('idTypeDetector', 'geneSymbol', function () {
      return import('./src/GeneSymbolDetector');
    }, {
      factory: 'human',
      name: 'GeneSymbol',
      idType: 'GeneSymbol_human',
      options: {
        sampleType: 'GeneSymbol'
      }
    });
    /// #endif

    /// #if include('bob')
    registry.push('bobSearchProvider', 'gene', function () {
      return import('./src/SearchProvider')
    }, {
      factory: 'createGene',
      idType: 'Ensembl',
      name: 'Genes'
    });
    /// #endif
  }


  registry.push('tdpView', 'celllinedb_cellline', function () {
    return import('./src/views/CelllineList');
  }, {
    name: 'Cell lines',
    idtype: 'Cellline',
    selection: 'none',
    sampleType: 'Cellline'
  });
  registry.push('tdpView', 'bioinfodb_tissue_start', function () {
    return import('./src/views/TissueList');
  }, {
    name: 'Tissues',
    idtype: 'Tissue',
    selection: 'none',
    sampleType: 'Tissue'
  });
  //views
  ['Tissue', 'Cellline'].forEach(function (idType) {
    const plain = idType.toLowerCase();
    const label = idType === 'Tissue' ? 'Tissues' : 'Cell lines';

    registry.push('tdpView', plain + '_inverted_expressiontable', function () {
      return import('./src/views/DependentGeneTable');
    }, {
      name: 'Expression',
      factory: 'createExpressionTable',
      idtype: idType,
      sampleType: idType,
      selection: 'some',
      group: {
        name: 'Gene overview',
        order: 20
      }
    });

    registry.push('tdpView', plain + '_inverted_copynumbertable', function () {
      return import('./src/views/DependentGeneTable');
    }, {
      name: 'Copy Number',
      factory: 'createCopyNumberTable',
      idtype: idType,
      sampleType: idType,
      selection: 'some',
      group: {
        name: 'Gene overview',
        order: 0
      }
    });

    registry.push('tdpView', plain + '_inverted_mutationtable', function () {
      return import('./src/views/DependentGeneTable');
    }, {
      name: 'Mutation',
      factory: 'createMutationTable',
      idtype: idType,
      sampleType: idType,
      selection: 'some',
      group: {
        name: 'Gene overview',
        order: 20
      }
    });

    registry.push('tdpView', plain + '_combined_lineup', function () {
      return import('./src/views/CombinedDependentGeneTable');
    }, {
      name: 'Combined View',
      idtype: idType,
      selection: 'some',
      group: {
        name: 'Gene overview',
        order: 40
      },
      filter: {
        species: 'human'
      }
    });

    registry.push('tdpView', plain + '_generic_detail_view', function () {
      return import('./src/views/InfoTable.ts');
    }, {
      name: 'Database Info',
      factory: 'new ' + idType + 'InfoTable',
      idtype: idType,
      selection: 'multiple',
      group: {
        name: 'General',
        order: 0
      }
    });


    /// #if include('bob')
    registry.push('bobSearchProvider', idType.toLowerCase(), function () {
      return import('./src/SearchProvider')
    }, {
      factory: 'create' + idType,
      idType: idType,
      name: label
    });
    /// #endif


    registry.push('idTypeDetector', plain + 'IDTypeDetector', function () {
      return import('./src/IDTypeDetector');
    }, {
      factory: 'create',
      name: label + ' IDType Detector',
      idType: idType,
      options: {
        sampleType: idType
      }
    });
  });

  //scores

  //gene_(Tissue|Celline)
  ['Tissue', 'Cellline'].forEach(function (oppositeIDType) {
    const prefix = 'gene_' + oppositeIDType.toLowerCase();
    registry.push('tdpScore', prefix + '_aggregated_score', function () {
      return import('./src/scores');
    }, {
      name: 'Aggregated ' + oppositeIDType + ' Score',
      idtype: 'Ensembl',
      primaryType: 'Ensembl',
      oppositeType: oppositeIDType
    });
    registry.push('tdpScoreImpl', prefix + '_aggregated_score', function () {
      return import('./src/scores');
    }, {
      factory: 'createScore',
      primaryType: 'Ensembl',
      oppositeType: oppositeIDType
    });
    registry.push('tdpScore', prefix + '_single_score', function () {
      return import('./src/scores/SingleScore');
    }, {
      name: 'Single ' + oppositeIDType + ' Score',
      idtype: 'Ensembl',
      primaryType: 'Ensembl',
      oppositeType: oppositeIDType
    });
    registry.push('tdpScoreImpl', prefix + '_single_score', function () {
      return import('./src/scores/SingleScore');
    }, {
      factory: 'createScore',
      primaryType: 'Ensembl',
      oppositeType: oppositeIDType
    });
  });

  //(Tissue|Celline)_gene scores
  ['Tissue', 'Cellline'].forEach(function (idType) {
    const prefix = idType.toLowerCase() + '_gene';

    registry.push('tdpScore', prefix + '_aggregated_score', function () {
      return import('./src/scores');
    }, {
      name: 'Aggregated Score',
      idtype: idType,
      primaryType: idType,
      oppositeType: 'Ensembl'
    });
    registry.push('tdpScoreImpl', prefix + '_aggregated_score', function () {
      return import('./src/scores');
    }, {
      factory: 'createScore',
      primaryType: idType,
      oppositeType: 'Ensembl'
    });
    registry.push('tdpScore', prefix + '_single_score', function () {
      return import('./src/scores/SingleScore');
    }, {
      name: 'Single Gene Score',
      idtype: idType,
      primaryType: idType,
      oppositeType: 'Ensembl'
    });
    registry.push('tdpScoreImpl', prefix + '_single_score', function () {
      return import('./src/scores/SingleScore');
    }, {
      factory: 'createScore',
      primaryType: idType,
      oppositeType: 'Ensembl'
    });
  });

  registry.push('chooserConfig', 'chooser_header_order', function () {
  }, {
    order: {
      'General': 5,
      'Sample overview': 10,
      'Gene overview': 20,
      'Visualization': 30,
      'Internal resources': 40,
      'External resources': 50,
      'Other': 1000
    }
  });

  registry.push('tdpView', 'pubmed', function () {
    return import('./src/views/GeneSymbolProxyView');
  }, {
    name: 'PubMed',
    factory: 'new',
    site: '//www.ncbi.nlm.nih.gov/pubmed?term={gene}',
    argument: 'gene',
    idtype: 'Ensembl',
    selection: 'chooser',
    group: {
      name: 'External resources'
      // order: 60
    }
  });


  // generator-phovea:end
};
