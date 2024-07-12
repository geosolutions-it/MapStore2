import expect from 'expect';
import {Parser, validator} from '../FeatureInfoUtils';

describe('FeatureInfoUtils', () => {
    // **********************************
    // HTML
    // **********************************
    const styleSample = '<style type="text/css">.sample {border:1px solid #ddd;}</style>';
    const bodySample = '<div class="sample">TEST text</div>';
    const rowHTML = '<html>'
        + '<head>'
        + '<title>Geoserver GetFeatureInfo output</title>'
        + styleSample
        + '</head>'
        + '<body>'
        + bodySample
        + '</body>'
        + '</html>';

    const bodyWithStyle = styleSample + bodySample;
    const emptyHTML = '<html>'
        + '<head>'
        + '<title>Geoserver GetFeatureInfo output</title>'
        + styleSample
        + '</head>'
        + '<body>'
        + '</body>'
        + '</html>';
    it('HTML Parser', () => {
        var parsedBody = Parser.HTML.getBody(rowHTML);
        var parsedStyle = Parser.HTML.getStyle(rowHTML);
        var parsedHTML = Parser.HTML.getBodyWithStyle(rowHTML);
        expect(parsedBody).toBe(bodySample);
        expect(parsedStyle).toBe(styleSample);
        expect(parsedHTML).toBe(bodyWithStyle);

    });
    it('HTML Validator', () => {
        const responseValidator = validator("HTML");

        // Default fetch all values
        expect(responseValidator.isValidResponse({response: rowHTML})).toBe(true);
        expect(responseValidator.isValidResponse({response: emptyHTML})).toBe(false);

        // test regex
        let validRegex = "<div[^>]*>[\\s\\S]*<\\/div>";
        let invalidRegex = "<table[^>]*>[\\s\\S]*<\\/table>";

        let valid;
        valid = responseValidator.isValidResponse({response: rowHTML, layerMetadata: {regex: validRegex }});
        expect(valid).toBe(true);

        valid = responseValidator.isValidResponse({response: rowHTML, layerMetadata: {regex: invalidRegex }});
        expect(valid).toBe(false);
    });

    it('HTML valid html contained in xml',  () => {
        const htmlInXML =  '<?xml version="1.0" encoding="ISO-8859-1"?>' + rowHTML;
        const valid = validator("HTML").isValidResponse({response: htmlInXML});
        expect(valid).toBe(true);
    });

    it("HTML should return invalid if html is not valid", () => {
        const inValidXML = `<?xml version='1.0' encoding="ISO-8859-1"  standalone="no" ?>
        <ServiceExceptionReport version="1.1.1">
          <ServiceException code="InvalidFormat">
            <![CDATA[
            Parámetros erroneos:
            formato = image/png
            XMin = -412208.172942018
            YMin =  4928258.28942967
            XMax = -411725.664200968
            YMax =  4928740.79817072
            AnchoPixels =  101
            AltoPixels =  101
            Transparente = No
            Descripción error:
            layers (AD.ADDRESSA) No soportada.]]>
           </ServiceException>
        </ServiceExceptionReport>`;
        const valid = validator("HTML").isValidResponse({response: inValidXML});
        expect(valid).toBe(false);
    });

    // **********************************
    // TEXT
    // **********************************
    const baseTextGFI = 'GetFeatureInfo results:\n';
    const validTEXT = baseTextGFI
        + '\n'
        + "Layer 'LimiteRegionale''\n"
        + "Feature 0:'\n"
        + "uuid = 'fc1132ee-cf89-4fb0-a25d-315bb3c34568''\n";
    const notValid = '';
    const noFeaturesFoundText = 'no features were found';

    it('TEXT Validator', () => {
        const responseValidator = validator("TEXT");
        let valid;

        valid = responseValidator.isValidResponse({response: validTEXT});
        expect(valid).toBe(true);

        valid = responseValidator.isValidResponse({response: notValid});
        expect(valid).toBe(false);

        valid = responseValidator.isValidResponse({response: noFeaturesFoundText});
        expect(valid).toBe(false);
    });

    // **********************************
    // PROPERTIES
    // **********************************
    const validJSON = {"type": "FeatureCollection", "totalFeatures": "unknown", "features": [{"type": "Feature", "id": "", "geometry": null, "properties": {"precip30min": 816}}], "crs": null};
    const emptyJSON = {"type": "FeatureCollection", "totalFeatures": "unknown", "features": [], "crs": null};
    it('PROPERTIES Validator', () => {
        const responseValidator = validator("JSON");
        let valid;

        valid = responseValidator.isValidResponse({response: validJSON});
        expect(valid).toBe(true);

        valid = responseValidator.isValidResponse({response: emptyJSON});
        expect(valid).toBe(false);
    });

});
