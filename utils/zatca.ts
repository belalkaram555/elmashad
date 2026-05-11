
export const generateZatcaBase64 = (
    sellerName: string,
    taxId: string,
    dateIso: string,
    totalWithTax: string,
    taxAmount: string
  ): string => {
    
    // Helper to get Length as byte
    const getLength = (len: number): Uint8Array => {
        return new Uint8Array([len]);
    };

    // Helper to create Tag-Length-Value
    const createTLV = (tag: number, value: string): Uint8Array => {
        const encoder = new TextEncoder();
        const valBytes = encoder.encode(value);
        const tagByte = new Uint8Array([tag]);
        const lenByte = getLength(valBytes.length);
        
        const tlv = new Uint8Array(tagByte.length + lenByte.length + valBytes.length);
        tlv.set(tagByte, 0);
        tlv.set(lenByte, 1);
        tlv.set(valBytes, 2);
        return tlv;
    };

    // 1. Seller Name
    const tag1 = createTLV(1, sellerName);
    // 2. Tax ID
    const tag2 = createTLV(2, taxId);
    // 3. Timestamp (Format: YYYY-MM-DDTHH:mm:ssZ)
    const tag3 = createTLV(3, dateIso);
    // 4. Invoice Total (with tax)
    const tag4 = createTLV(4, totalWithTax);
    // 5. VAT Total
    const tag5 = createTLV(5, taxAmount);

    // Concatenate all tags
    const totalLength = tag1.length + tag2.length + tag3.length + tag4.length + tag5.length;
    const allTags = new Uint8Array(totalLength);
    let offset = 0;
    
    [tag1, tag2, tag3, tag4, tag5].forEach(tag => {
        allTags.set(tag, offset);
        offset += tag.length;
    });

    // Convert to Base64
    let binary = '';
    const len = allTags.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(allTags[i]);
    }
    return btoa(binary);
};
