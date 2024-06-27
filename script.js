function generateXSD() {
    const jsonInput = document.getElementById("jsonInput").value;
    const targetNamespace = document.getElementById("targetNamespace").value;
    const rootElementName = document.getElementById("rootElementName").value;

    try {
        const jsonObject = JSON.parse(jsonInput);
        const xsd = generateXsdFromJson(jsonObject, targetNamespace, rootElementName);

        const formattedXsd = formatXml(xsd);
        document.getElementById("output").value = formattedXsd;
    } catch (e) {
        document.getElementById("output").value = "Invalid JSON input";
    }
}

function generateXsdFromJson(jsonObject, targetNamespace, rootElementName) {
    let xsd = '<?xml version="1.0" encoding="UTF-8"?>';
    xsd += `<xsd:schema targetNamespace="${targetNamespace}" xmlns="${targetNamespace}" xmlns:xsd="http://www.w3.org/2001/XMLSchema">`;
    xsd += `<xsd:complexType name="${rootElementName}">`;
    xsd += generateXsdElementsFromJson(jsonObject, false);
    xsd += `</xsd:complexType>`;
    xsd += '</xsd:schema>';
    return xsd;
}

function generateXsdElementsFromJson(jsonObject, isNested) {
    let xsd = `<xsd:sequence>`;
    for (let key in jsonObject) {
        if (!jsonObject.hasOwnProperty(key)) continue;
        if (jsonObject[key] === null || typeof jsonObject[key] !== 'object') {
            let type = 'xsd:string';
            let maxOccurs = '1';
            if (Array.isArray(jsonObject[key])) {
                maxOccurs = 'unbounded';
                xsd += `<xsd:element name="${key}" type="${type}" minOccurs="0" maxOccurs="${maxOccurs}"/>`;
            } else {
                xsd += `<xsd:element name="${key}" type="${type}" minOccurs="0" maxOccurs="1"/>`;
            }
        } else if (Array.isArray(jsonObject[key])) {
            if (typeof jsonObject[key][0] === 'object') {
                xsd += `<xsd:element name="${key}" minOccurs="0" maxOccurs="unbounded">`;
                xsd += `<xsd:complexType>`;
                xsd += generateXsdElementsFromJson(jsonObject[key][0], true);
                xsd += `</xsd:complexType>`;
                xsd += `</xsd:element>`;
            } else {
                xsd += `<xsd:element name="${key}" type="xsd:string" minOccurs="0" maxOccurs="unbounded"/>`;
            }
        } else {
            xsd += `<xsd:element name="${key}" minOccurs="0" maxOccurs="1">`;
            xsd += `<xsd:complexType>`;
            xsd += generateXsdElementsFromJson(jsonObject[key], true);
            xsd += `</xsd:complexType>`;
            xsd += `</xsd:element>`;
        }
    }
    xsd += `</xsd:sequence>`;
    return xsd;
}

function formatXml(xml) {
    const PADDING = ' '.repeat(2); // set desired indentation level
    const reg = /(>)(<)(\/*)/g;
    let pad = 0;
    xml = xml.replace(reg, '$1\r\n$2$3');
    return xml.split('\r\n').map((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/) && pad !== 0) {
            pad -= 1;
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }
        pad += indent;
        return PADDING.repeat(pad - indent) + node;
    }).join('\r\n');
}

function downloadXSD() {
    const xsd = document.getElementById("output").value;
    const rootElementName = document.getElementById("rootElementName").value || 'schema';
    const blob = new Blob([xsd], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rootElementName}.xsd`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

