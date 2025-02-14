
const fgpURL = "https://sidgad.cloud/shared/portales_files/agenda_portales.php?cliente=fgpatinaxe&idm=1&id_temp=31";
const FILTER_ONLY = "RAXOI";
const WEEK_DAYS = ['Domingo', 'Luns', 'Martes', 'Mercores', 'Xoves', 'Venres', 'Sabado'];
const CATEGORY_ORDER = [
  "MICRO", "PREBENJA", "BENJA", "ALEV", 
  "INFANTIL", "JUVENIL", "SENIOR", 
  "SUB 13", "SUB", "COPA", "OK LIGA OURO"];

const ligas = {
        'OK LIGA OURO FEMENINA': 'https://www.server2.sidgad.es/rfep/rfep_cal_idc_2817_1.php',
        'OK LIGA BRONCE NORTE': 'https://www.server2.sidgad.es/rfep/rfep_cal_idc_2823_1.php',
        'OK LIGA PLATA FEMENINA 2023': 'https://www.server2.sidgad.es/rfep/rfep_cal_idc_2097_1.php',
        'OK LIGA BRONCE NORTE 2023': 'https://www.server2.sidgad.es/rfep/rfep_cal_idc_2098_1.php'
      }

const leagueColors = {
  'MICRO': '#770000', 
  'PREBENJAMÍN SUR 1': '#FF5733',
  'PREBENJAMÍN SUR 2': '#FF1713',
  'BENJAMÍN': '#FFC300',
  'ALEVÍN': '#33FF57',
  'INFANTIL': '#FFED87',
  'JUVENIL': '#33C3FF',
  'SENIOR': '#518BDE',
  'SUB 13 FEMENINA': '#f5a7f3',
  'SUB17 FEMENINA': '#cb52ab',
  'OK LIGA BRONCE': '#0657C9',
  'OK LIGA PLATA': '#FF57AA',
  'OK LIGA OURO FEMENINA': '#EA03FF'
};