export const AR_IMAGE_TAGS = [
  {name:"Content-Type", value:"image/jpeg"},
  {name:"App-Name", value:"Lookso"}
];

export const AR_OBJECT_TAGS = [
  {name:"Content-Type", value:"application/json"},
  {name:"App-Name", value:"Lookso"}
]

export function arweaveTxToUrl(txId: string): string {
  return 'ar://' + txId;
}
