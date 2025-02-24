enum FontType {
  BOLD = 'BOLD',
  OBLIQUE = 'OBLIQUE',
}

//TODO math & quoted http://mirrors.ibiblio.org/CTAN/systems/win32/bakoma/fonts/fonts.html
// Math Italic	cmmi	5 6 7 8 9 10 12
// Math Bold Italic	cmmib	5 6 7 8 9 10
// Math Symbols	cmsy	5 6 7 8 9 10
// Math Bold Symbols	cmbsy	5 6 7 8 9 10
// Math Extension	cmex	7 8 9 10
// SansSerif Quoted	cmssq	8
// SansSerif Quoted Italic	cmssqi	8

//TODO slanted ?

export default FontType;

const boldTypeFragments = [
  'bold',
  'heavy',
  'cmb',
  'cmbx',
  'cmbsy',
  'cmssbx',
  'logobf',
  'lcmssb',
  'eufb',
  'eurb',
  'eusb',
  'cmcbx',
  'cmcb',
  'cmcbxsl',
  'cmcssbx',
  'ecbl',
  'tcbl',
  'ecbx',
  'tcbx',
  'ecrb',
  'tcrb',
  'ecxc',
  'ecoc',
  'ecsx',
  'tcsx',
  'labl',
  'labx',
  'larb',
  'laxc',
  'laoc',
  'lasx',
  't1bx',
  't1b',
  't1bxsl',
  't1ssbx',
  't2bx',
  't2b',
  't2ssbx',
];
const obliqueTypeFragments = [
  'oblique',
  'italic',
  'cmti',
  'cmmi',
  'cmu',
  'cmitt',
  'cmssi',
  'cmssqi',
  'cmfi',
  'lcmssi',
  'cmcti',
  'cmcbxti',
  'cmcitt',
  'cmcssi',
  'cmcssqi',
  'ccti',
  'eoti',
  'toti',
  'ecti',
  'tcti',
  'ecci',
  'tcci',
  'ecui',
  'tcui',
  'ecit',
  'tcit',
  'ecvi',
  'tcvi',
  'lati',
  'laci',
  'laui',
  'lait',
  'lavi',
  't1ti',
  't1itt',
  't1ssi',
  't2ti',
  't2itt',
  't2ssi',
];

const boldAndObliqueTypeFragments = [
  'cmmib',
  'cmbxti',
  'ecbi',
  'tcbi',
  'ecso',
  'tcso',
  'labi',
  'laso',
  't1bxti',
  't2bxti',
];

export function declaredFontTypes(fontName: string): FontType[] {
  const fontNameLowerCase = fontName.toLowerCase();
  const boldAndOblique = boldAndObliqueTypeFragments.find((fragment) => fontNameLowerCase.includes(fragment));
  let bold: boolean;
  let oblique: boolean;
  if (boldAndOblique) {
    bold = true;
    oblique = true;
  } else {
    bold = !!boldTypeFragments.find((fragment) => fontNameLowerCase.includes(fragment));
    oblique = !!obliqueTypeFragments.find((fragment) => fontNameLowerCase.includes(fragment));
  }
  const fontTypes: FontType[] = [];
  if (bold) {
    fontTypes.push(FontType.BOLD);
  }
  if (oblique) {
    fontTypes.push(FontType.OBLIQUE);
  }
  return fontTypes;
}
