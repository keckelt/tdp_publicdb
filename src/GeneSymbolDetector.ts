import {getTDPData} from 'tdp_core';

async function detectIDType(data: any[], accessor: (row: any) => string, sampleSize: number) {
  const values = [];
  let validSize = 0;
  for(let i = 0; i < sampleSize; ++i) {
    const v = accessor(data[i]);

    if (!v || v.trim().length === 0) {
      continue; //skip empty samples
    }
    values.push(v);
    ++validSize;
  }

  const result = await getTDPData<{matches: number}>('publicdb', 'gene_match_symbols/filter', {filter_symbol: values});
  return result[0].matches / validSize;
}

export function human() {
  return {
    detectIDType
  };
}
