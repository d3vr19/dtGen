document.addEventListener('DOMContentLoaded', (event) => {
    const targetNamespaceInput = document.getElementById('targetNamespace');
    const rootElementNameInput = document.getElementById('rootElementName');
    const jsonInput = document.getElementById('jsonInput');
    const generateButton = document.getElementById('generateButton');
    const downloadButton = document.getElementById('downloadButton');

    targetNamespaceInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            rootElementNameInput.focus();
        }
    });

    rootElementNameInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            jsonInput.focus();
        }
    });

    jsonInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            generateButton.click();
        }
    });

    generateButton.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            generateXSD();
            if (document.getElementById('output').value.trim() !== "") {
                downloadButton.focus();
            }
        }
    });

    downloadButton.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            downloadXSD();
        }
    });
});

function generateXSD() {
    const e = document.getElementById("jsonInput").value;
    const t = document.getElementById("targetNamespace").value;
    const n = document.getElementById("rootElementName").value;
    try {
        const m = JSON.parse(e);
        const o = formatXml(generateXsdFromJson(m, t, n));
        document.getElementById("output").value = o;
        // Move focus to download button if XSD generation is successful
        if (o.trim() !== "") {
            document.getElementById('downloadButton').focus();
        }
    } catch (e) {
        document.getElementById("output").value = "Invalid JSON input";
    }
}

function generateXsdFromJson(e, t, n) {
    let m = '<?xml version="1.0" encoding="UTF-8"?>';
    m += `<xsd:schema targetNamespace="${t}" xmlns="${t}" xmlns:xsd="http://www.w3.org/2001/XMLSchema">`;
    m += `<xsd:complexType name="${n}">`;
    m += generateXsdElementsFromJson(e, !1);
    m += "</xsd:complexType>";
    m += "</xsd:schema>";
    return m;
}

function generateXsdElementsFromJson(e, t) {
    let n = "<xsd:sequence>";
    for (let t in e) if (e.hasOwnProperty(t)) if (null === e[t] || "object" != typeof e[t]) {
        let m = "xsd:string", o = "1";
        Array.isArray(e[t]) ? (o = "unbounded", n += `<xsd:element name="${t}" type="${m}" minOccurs="0" maxOccurs="${o}"/>`) : n += `<xsd:element name="${t}" type="${m}" minOccurs="0" maxOccurs="1"/>`
    } else Array.isArray(e[t]) ? "object" == typeof e[t][0] ? (n += `<xsd:element name="${t}" minOccurs="0" maxOccurs="unbounded">`, n += "<xsd:complexType>", n += generateXsdElementsFromJson(e[t][0], !0), n += "</xsd:complexType>", n += "</xsd:element>") : n += `<xsd:element name="${t}" type="xsd:string" minOccurs="0" maxOccurs="unbounded"/>` : (n += `<xsd:element name="${t}" minOccurs="0" maxOccurs="1">`, n += "<xsd:complexType>", n += generateXsdElementsFromJson(e[t], !0), n += "</xsd:complexType>", n += "</xsd:element>");
    return n += "</xsd:sequence>", n
}

function formatXml(e) {
    const t = " ".repeat(2);
    let n = 0;
    return (e = e.replace(/(>)(<)(\/*)/g, "$1\r\n$2$3")).split("\r\n").map((e => {
        let m = 0;
        return e.match(/.+<\/\w[^>]*>$/) ? m = 0 : e.match(/^<\/\w/) && 0 !== n ? n -= 1 : m = e.match(/^<\w[^>]*[^\/]>.*$/) ? 1 : 0, n += m, t.repeat(n - m) + e
    })).join("\r\n")
}

function downloadXSD() {
    const e = document.getElementById("output").value;
    const t = document.getElementById("rootElementName").value || "schema";
    const n = new Blob([e], { type: "application/xml" });
    const m = URL.createObjectURL(n);
    const o = document.createElement("a");
    o.href = m, o.download = `${t}.xsd`, document.body.appendChild(o), o.click(), document.body.removeChild(o), URL.revokeObjectURL(m)
}
