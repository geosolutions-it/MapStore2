import expect from 'expect';
import {Parser, validator} from '../FeatureInfoUtils';

describe('FeatureInfoUtils', () => {
    // **********************************
    // HTML
    // **********************************
    const styleSample = '<style type="text/css">.sample {border:1px solid #ddd;}</style>';
    const bodySample = '<div class="sample">TEST text</div>';
    const lizmapFragment = `
        <div class="lizmapPopupSingleFeature" data-feature-id="23" data-layer-id="v_cat20180426181713938">
    <h4 class="lizmapPopupTitle">Cat houses</h4>

    <div class="lizmapPopupDiv">
    <input type="hidden" value="v_cat20180426181713938.23" class="lizmap-popup-layer-feature-id"/>
<input type="hidden" value="POINT (-8201386.38562475 4976532.96066171)" class="lizmap-popup-layer-feature-geometry"/>
<input type="hidden" value="" class="lizmap-popup-layer-feature-crs"/>
<input type="hidden" value="-8201386.38562475" class="lizmap-popup-layer-feature-bbox-minx"/>
<input type="hidden" value="4976532.96066171" class="lizmap-popup-layer-feature-bbox-miny"/>
<input type="hidden" value="-8201386.38562475" class="lizmap-popup-layer-feature-bbox-maxx"/>
<input type="hidden" value="4976532.96066171" class="lizmap-popup-layer-feature-bbox-maxy"/>
<lizmap-feature-toolbar edition-restricted="true" value="v_cat20180426181713938.23" crs="" bbox-minx="-8201386.38562475" bbox-miny="4976532.96066171" bbox-maxx="-8201386.38562475" bbox-maxy="4976532.96066171" ></lizmap-feature-toolbar>
<script language="javascript">
    var cat_image_load_attempt = 0;

    function imgError(image) {
        if(cat_image_load_attempt == 0){
            image.src = image.src.replace('.jpg', '-600x403.jpg');
        }
        if(cat_image_load_attempt == 1){
            image.src = 'http://cattracker.org/wp-content/uploads/missing-cat-600x403.jpg';
        }
        cat_image_load_attempt+= 1;
    }

</script>

<p style="width:100%;font-width:14px;color:black;font-weight:bold;text-align:center;border:2px solid #6600FF">Schubie2</p>

<img id="cat_image" src="https://demo.lizmap.com/lizmap/index.php/view/media/getMedia?repository=features&project=cats&path=media%2Fdata_cats%2Fschubie.jpg" style="width:100%;" alt="" onerror="imgError(this);">

<table class="table table-condensed table-striped">
<tr><td>Territory area (ha)</td><td>3,03</td></tr>
<tr><td>Survey duration (days)</td><td>41</td></tr>
<tr><td>Start</td><td>2014-10-31T01:30:08.384Z</td></tr>
<tr><td>End</td><td>2014-12-10T22:45:29.856Z</td></tr>
</table>    </div>
</div>
    `;
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

    it('HTML Validator accepts a non-empty HTML fragment without a body element', () => {
        const valid = validator("HTML").isValidResponse({response: lizmapFragment});
        expect(valid).toBe(true);
    });

    it('HTML Validator rejects a whitespace-only HTML fragment', () => {
        const valid = validator("HTML").isValidResponse({response: ' \n\t '});
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
