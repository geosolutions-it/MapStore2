export const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<wps:ProcessDescriptions xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xml:lang="en" service="WPS" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
  <ProcessDescription wps:processVersion="1.0.0" statusSupported="true" storeSupported="true">
    <ows:Identifier>gs:DownloadEstimator</ows:Identifier>
    <ows:Title>Estimator Process</ows:Title>
    <ows:Abstract>Checks if the input file does not exceed the limits</ows:Abstract>
    <DataInputs>
      <Input maxOccurs="1" minOccurs="1">
        <ows:Identifier>layerName</ows:Identifier>
        <ows:Title>layerName</ows:Title>
        <ows:Abstract>Original layer to download</ows:Abstract>
        <LiteralData>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>filter</ows:Identifier>
        <ows:Title>filter</ows:Title>
        <ows:Abstract>Optional Vectorial Filter</ows:Abstract>
        <ComplexData>
          <Default>
            <Format>
              <MimeType>text/xml; subtype=filter/1.0</MimeType>
            </Format>
          </Default>
          <Supported>
            <Format>
              <MimeType>text/xml; subtype=filter/1.0</MimeType>
            </Format>
            <Format>
              <MimeType>text/xml; subtype=filter/1.1</MimeType>
            </Format>
            <Format>
              <MimeType>text/plain; subtype=cql</MimeType>
            </Format>
          </Supported>
        </ComplexData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>targetCRS</ows:Identifier>
        <ows:Title>targetCRS</ows:Title>
        <ows:Abstract>Target CRS</ows:Abstract>
        <LiteralData>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>RoiCRS</ows:Identifier>
        <ows:Title>RoiCRS</ows:Title>
        <ows:Abstract>Region Of Interest CRS</ows:Abstract>
        <LiteralData>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>ROI</ows:Identifier>
        <ows:Title>ROI</ows:Title>
        <ows:Abstract>Region Of Interest</ows:Abstract>
        <ComplexData>
          <Default>
            <Format>
              <MimeType>text/xml; subtype=gml/3.1.1</MimeType>
            </Format>
          </Default>
          <Supported>
            <Format>
              <MimeType>text/xml; subtype=gml/3.1.1</MimeType>
            </Format>
            <Format>
              <MimeType>text/xml; subtype=gml/2.1.2</MimeType>
            </Format>
            <Format>
              <MimeType>application/wkt</MimeType>
            </Format>
            <Format>
              <MimeType>application/gml-3.1.1</MimeType>
            </Format>
            <Format>
              <MimeType>application/gml-2.1.2</MimeType>
            </Format>
            <Format>
              <MimeType>application/json</MimeType>
            </Format>
          </Supported>
        </ComplexData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>cropToROI</ows:Identifier>
        <ows:Title>cropToROI</ows:Title>
        <ows:Abstract>Crop to ROI</ows:Abstract>
        <LiteralData>
          <ows:DataType>xs:boolean</ows:DataType>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>targetSizeX</ows:Identifier>
        <ows:Title>targetSizeX</ows:Title>
        <ows:Abstract>X Size of the Target Image (applies to raster data only), or native resolution if missing</ows:Abstract>
        <LiteralData>
          <ows:DataType>xs:int</ows:DataType>
          <ows:AllowedValues>
            <ows:Range ows:rangeClosure="closed-open">
              <ows:MinimumValue>1.0</ows:MinimumValue>
            </ows:Range>
          </ows:AllowedValues>
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>targetSizeY</ows:Identifier>
        <ows:Title>targetSizeY</ows:Title>
        <ows:Abstract>Y Size of the Target Image (applies to raster data only), or native resolution if missing</ows:Abstract>
        <LiteralData>
          <ows:DataType>xs:int</ows:DataType>
          <ows:AllowedValues>
            <ows:Range ows:rangeClosure="closed-open">
              <ows:MinimumValue>1.0</ows:MinimumValue>
            </ows:Range>
          </ows:AllowedValues>
        </LiteralData>
      </Input>
      <Input maxOccurs="2147483647" minOccurs="0">
        <ows:Identifier>selectedBands</ows:Identifier>
        <ows:Title>selectedBands</ows:Title>
        <ows:Abstract>Band Selection Indices</ows:Abstract>
        <LiteralData>
          <ows:DataType>xs:int</ows:DataType>
          <ows:AnyValue />
        </LiteralData>
      </Input>
    </DataInputs>
    <ProcessOutputs>
      <Output>
        <ows:Identifier>result</ows:Identifier>
        <ows:Title>result</ows:Title>
        <LiteralOutput>
          <ows:DataType>boolean</ows:DataType>
        </LiteralOutput>
      </Output>
    </ProcessOutputs>
  </ProcessDescription>
  <ProcessDescription wps:processVersion="1.0.0" statusSupported="true" storeSupported="true">
    <ows:Identifier>gs:Download</ows:Identifier>
    <ows:Title>Enterprise Download Process</ows:Title>
    <ows:Abstract>Downloads Layer Stream and provides a ZIP.</ows:Abstract>
    <DataInputs>
      <Input maxOccurs="1" minOccurs="1">
        <ows:Identifier>layerName</ows:Identifier>
        <ows:Title>layerName</ows:Title>
        <ows:Abstract>Original layer to download</ows:Abstract>
        <LiteralData>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>filter</ows:Identifier>
        <ows:Title>filter</ows:Title>
        <ows:Abstract>Optional Vector Filter</ows:Abstract>
        <ComplexData>
          <Default>
            <Format>
              <MimeType>text/xml; subtype=filter/1.0</MimeType>
            </Format>
          </Default>
          <Supported>
            <Format>
              <MimeType>text/xml; subtype=filter/1.0</MimeType>
            </Format>
            <Format>
              <MimeType>text/xml; subtype=filter/1.1</MimeType>
            </Format>
            <Format>
              <MimeType>text/plain; subtype=cql</MimeType>
            </Format>
          </Supported>
        </ComplexData>
      </Input>
      <Input maxOccurs="1" minOccurs="1">
        <ows:Identifier>outputFormat</ows:Identifier>
        <ows:Title>outputFormat</ows:Title>
        <ows:Abstract>format Mime-Type</ows:Abstract>
        <LiteralData>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>targetCRS</ows:Identifier>
        <ows:Title>targetCRS</ows:Title>
        <ows:Abstract>Optional Target CRS</ows:Abstract>
        <LiteralData>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>RoiCRS</ows:Identifier>
        <ows:Title>RoiCRS</ows:Title>
        <ows:Abstract>Optional Region Of Interest CRS</ows:Abstract>
        <LiteralData>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>ROI</ows:Identifier>
        <ows:Title>ROI</ows:Title>
        <ows:Abstract>Optional Region Of Interest (Polygon)</ows:Abstract>
        <ComplexData>
          <Default>
            <Format>
              <MimeType>text/xml; subtype=gml/3.1.1</MimeType>
            </Format>
          </Default>
          <Supported>
            <Format>
              <MimeType>text/xml; subtype=gml/3.1.1</MimeType>
            </Format>
            <Format>
              <MimeType>text/xml; subtype=gml/2.1.2</MimeType>
            </Format>
            <Format>
              <MimeType>application/wkt</MimeType>
            </Format>
            <Format>
              <MimeType>application/gml-3.1.1</MimeType>
            </Format>
            <Format>
              <MimeType>application/gml-2.1.2</MimeType>
            </Format>
            <Format>
              <MimeType>application/json</MimeType>
            </Format>
          </Supported>
        </ComplexData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>cropToROI</ows:Identifier>
        <ows:Title>cropToROI</ows:Title>
        <ows:Abstract>Crop to ROI</ows:Abstract>
        <LiteralData>
          <ows:DataType>xs:boolean</ows:DataType>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>interpolation</ows:Identifier>
        <ows:Title>interpolation</ows:Title>
        <ows:Abstract>Interpolation function to use when reprojecting / scaling raster data.  Values are NEAREST (default), BILINEAR, BICUBIC2, BICUBIC</ows:Abstract>
        <LiteralData>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>targetSizeX</ows:Identifier>
        <ows:Title>targetSizeX</ows:Title>
        <ows:Abstract>X Size of the Target Image (applies to raster data only), or native resolution if missing</ows:Abstract>
        <LiteralData>
          <ows:DataType>xs:int</ows:DataType>
          <ows:AllowedValues>
            <ows:Range ows:rangeClosure="closed-open">
              <ows:MinimumValue>1.0</ows:MinimumValue>
            </ows:Range>
          </ows:AllowedValues>
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>targetSizeY</ows:Identifier>
        <ows:Title>targetSizeY</ows:Title>
        <ows:Abstract>Y Size of the Target Image (applies to raster data only), or native resolution if missing</ows:Abstract>
        <LiteralData>
          <ows:DataType>xs:int</ows:DataType>
          <ows:AllowedValues>
            <ows:Range ows:rangeClosure="closed-open">
              <ows:MinimumValue>1.0</ows:MinimumValue>
            </ows:Range>
          </ows:AllowedValues>
        </LiteralData>
      </Input>
      <Input maxOccurs="2147483647" minOccurs="0">
        <ows:Identifier>selectedBands</ows:Identifier>
        <ows:Title>selectedBands</ows:Title>
        <ows:Abstract>Band Selection Indices</ows:Abstract>
        <LiteralData>
          <ows:DataType>xs:int</ows:DataType>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>writeParameters</ows:Identifier>
        <ows:Title>writeParameters</ows:Title>
        <ows:Abstract>Optional writing parameters</ows:Abstract>
        <ComplexData>
          <Default>
            <Format>
              <MimeType>text/xml</MimeType>
            </Format>
          </Default>
          <Supported>
            <Format>
              <MimeType>text/xml</MimeType>
            </Format>
          </Supported>
        </ComplexData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>minimizeReprojections</ows:Identifier>
        <ows:Title>minimizeReprojections</ows:Title>
        <ows:Abstract>When dealing with a Heterogeneous CRS mosaic, avoid reprojections of the granules within the ROI, having their nativeCRS equal to the targetCRS</ows:Abstract>
        <LiteralData>
          <ows:DataType>xs:boolean</ows:DataType>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>bestResolutionOnMatchingCRS</ows:Identifier>
        <ows:Title>bestResolutionOnMatchingCRS</ows:Title>
        <ows:Abstract>When dealing with a Heterogeneous CRS mosaic given a ROI and a TargetCRS, with no target size being specified, get the best  resolution of data having nativeCrs matching the TargetCRS</ows:Abstract>
        <LiteralData>
          <ows:DataType>xs:boolean</ows:DataType>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>resolutionsDifferenceTolerance</ows:Identifier>
        <ows:Title>resolutionsDifferenceTolerance</ows:Title>
        <ows:Abstract>the parameter allows to specify a tolerance value to control the use of native resolution of the data, when no target size has been specified and granules are reprojected. If  the percentage difference between original and reprojected coverages resolutions is below the specified tolerance value, native resolutions is the same for all the requested granules, the unit of measure is the same for native and target CRS, the reprojected coverage will be forced to use native resolutions</ows:Abstract>
        <LiteralData>
          <ows:DataType>xs:double</ows:DataType>
          <ows:AnyValue />
        </LiteralData>
      </Input>
      <Input maxOccurs="1" minOccurs="0">
        <ows:Identifier>targetVerticalCRS</ows:Identifier>
        <ows:Title>targetVerticalCRS</ows:Title>
        <ows:Abstract>Optional Target VerticalCRS </ows:Abstract>
        <LiteralData>
          <ows:AnyValue />
        </LiteralData>
      </Input>
    </DataInputs>
    <ProcessOutputs>
      <Output>
        <ows:Identifier>result</ows:Identifier>
        <ows:Title>result</ows:Title>
        <ComplexOutput>
          <Default>
            <Format>
              <MimeType>image/tiff</MimeType>
            </Format>
          </Default>
          <Supported>
            <Format>
              <MimeType>image/tiff</MimeType>
            </Format>
            <Format>
              <MimeType>application/zip</MimeType>
            </Format>
          </Supported>
        </ComplexOutput>
      </Output>
    </ProcessOutputs>
  </ProcessDescription>
</wps:ProcessDescriptions>
`;
