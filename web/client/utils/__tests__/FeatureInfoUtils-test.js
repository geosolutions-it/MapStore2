import expect from 'expect';
import {Parser, Validator} from '../FeatureInfoUtils';

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
        // Default fetch all values
        let results = Validator.HTML.getValidResponses([{response: emptyHTML}, {response: rowHTML}]);
        expect(results.length).toBe(1);

        let notValidResults = Validator.HTML.getNoValidResponses([{response: emptyHTML}, {response: rowHTML}]);
        expect(notValidResults.length).toBe(1);
        expect(notValidResults[0].response).toBe(emptyHTML);

        // test regex
        let validRegex = "<div[^>]*>[\\s\\S]*<\\/div>";
        let invalidRegex = "<table[^>]*>[\\s\\S]*<\\/table>";

        let validRegexResults = Validator.HTML.getValidResponses([{response: emptyHTML}, {response: rowHTML, layerMetadata: {regex: validRegex }}]);
        expect(validRegexResults.length).toBe(1);
        expect(validRegexResults[0].response).toBe(rowHTML);

        validRegexResults = Validator.HTML.getValidResponses([{response: emptyHTML}, {response: rowHTML, layerMetadata: {regex: validRegex }}]);
        expect(validRegexResults.length).toBe(1);

        let invalidRegexResults = Validator.HTML.getValidResponses([{response: emptyHTML}, {response: rowHTML, layerMetadata: {regex: invalidRegex }}]);
        expect(invalidRegexResults.length).toBe(0);

        validRegexResults = Validator.HTML.getNoValidResponses([{response: emptyHTML}, {response: rowHTML, layerMetadata: {regex: validRegex }}]);
        expect(validRegexResults.length).toBe(1); // only the empty is not valid

        invalidRegexResults = Validator.HTML.getNoValidResponses([{response: emptyHTML}, {response: rowHTML, layerMetadata: {regex: invalidRegex }}]);
        expect(invalidRegexResults.length).toBe(2); // both are not valid


    });

    it('HTML valid html contained in xml',  () => {
        const htmlInXML =  '<?xml version="1.0" encoding="ISO-8859-1"?>' + rowHTML;
        const validResults = Validator.HTML.getValidResponses([{response: htmlInXML}]);
        expect(validResults.length).toBe(1);
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
        const validResults = Validator.HTML.getNoValidResponses([{response: inValidXML}]);
        expect(validResults.length).toBe(1);
    });

    // **********************************
    // TEXT
    // **********************************
    const baseTextGFI = 'GetFeatureInfo results:\n';
    const notValid = '';
    const validTEXT = baseTextGFI
        + '\n'
        + "Layer 'LimiteRegionale''\n"
        + "Feature 0:'\n"
        + "uuid = 'fc1132ee-cf89-4fb0-a25d-315bb3c34568''\n";

    it('TEXT Validator', () => {
        let results = Validator.TEXT.getValidResponses([{response: notValid}, {response: validTEXT}]);
        expect(results.length).toBe(1);
        expect(results[0].response).toBe(validTEXT);

        results = Validator.TEXT.getValidResponses([{response: "no features were found"}, {response: validTEXT}]);
        expect(results.length).toBe(1);

        let notValidResults = Validator.TEXT.getNoValidResponses([{response: notValid}, {response: validTEXT}]);
        expect(notValidResults.length).toBe(1);
        expect(notValidResults[0].response).toBe(notValid);
    });

    // **********************************
    // PROPERTIES
    // **********************************
    const validJSON = {"type": "FeatureCollection", "totalFeatures": "unknown", "features": [{"type": "Feature", "id": "", "geometry": null, "properties": {"precip30min": 816}}], "crs": null};
    const emptyJSON = {"type": "FeatureCollection", "totalFeatures": "unknown", "features": [], "crs": null};
    it('PROPERTIES Validator', () => {
        let results = Validator.PROPERTIES.getValidResponses([{response: validJSON}, {response: emptyJSON}]);
        expect(results.length).toBe(1);
        expect(results[0].response).toBe(validJSON);

        let notValidResults = Validator.PROPERTIES.getNoValidResponses([{response: validJSON}, {response: emptyJSON}]);
        expect(notValidResults.length).toBe(1);
        expect(notValidResults[0].response).toBe(emptyJSON);
    });

    // **********************************
    // TEMPLATE
    // **********************************
    it('TEMPLATE Validator', () => {
        let results = Validator.TEMPLATE.getValidResponses([{response: validJSON}, {response: emptyJSON}]);
        expect(results.length).toBe(1);
        expect(results[0].response).toBe(validJSON);

        let notValidResults = Validator.TEMPLATE.getNoValidResponses([{response: validJSON}, {response: emptyJSON}]);
        expect(notValidResults.length).toBe(1);
        expect(notValidResults[0].response).toBe(emptyJSON);
    });

});
