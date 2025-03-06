
type CoverpointBin = {
  id: string;
  label: string;
  type: string;
  coverage: number;
};

type Coverpoint = {
  id: string;
  name: string;
  type: 'COVER_POINT';
  coverage: number;
  bins: CoverpointBin[];
};

type Cross = {
  id: string;
  name: string;
  type: 'COVER_CROSS';
  coverage: number;
  coverpoints: Coverpoint[];
};

type Cluster = {
  id: string;
  crosses: Cross[]
};


type Covergroup = {
  id: string
  name: string;
  coverage: number;
  coverageIncrease: number;
  coverpoints: Coverpoint[];
  crosses: Cross[];
  clusters: Cluster[];
};