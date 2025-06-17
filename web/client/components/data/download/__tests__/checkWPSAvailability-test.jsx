
// TODO use ./data/download-estimation.xml.js

// OLD Epic logic
// export const checkWPSAvailabilityEpic = (action$, store) => action$
//     .ofType(CHECK_WPS_AVAILABILITY)
//     .switchMap(({url, selectedService}) => {
//         return describeProcess(url, 'gs:DownloadEstimator,gs:Download')
//             .switchMap(response => Rx.Observable.defer(() => new Promise((resolve, reject) => parseString(response.data, {tagNameProcessors: [stripPrefix]}, (err, res) => err ? reject(err) : resolve(res)))))
//             .flatMap(xmlObj => {
//                 const state = store.getState();
//                 const layer = getSelectedLayer(state);
//                 const ids = [
//                     xmlObj?.ProcessDescriptions?.ProcessDescription?.[0]?.Identifier?.[0],
//                     xmlObj?.ProcessDescriptions?.ProcessDescription?.[1]?.Identifier?.[0]
//                 ];
//                 const isWpsAvailable = findIndex(ids, x => x === 'gs:DownloadEstimator') > -1 && findIndex(ids, x => x === 'gs:Download') > -1;
//                 const isWfsAvailable = layer.search?.url;
//                 const shouldSelectWps = isWpsAvailable && (selectedService === 'wps' || !isWfsAvailable);
//                 return Rx.Observable.of(
//                     setService(shouldSelectWps ? 'wps' : 'wfs'),
//                     setWPSAvailability(isWpsAvailable),
//                     checkingWPSAvailability(false)
//                 );
//             })
//             .catch(() => Rx.Observable.of(setService('wfs'), setWPSAvailability(false), checkingWPSAvailability(false)))
//             .startWith(checkingWPSAvailability(true));
//     });


// OLD UNIT TEST OF EPIC

// moved here from epics/tests/layerdownload.js

// it('check WPS availability', (done) => {
//         const epicResult = actions => {
//             expect(actions.length).toBe(4);
//             expect(actions[0].type).toBe(CHECKING_WPS_AVAILABILITY);
//             expect(actions[0].checking).toBe(true);
//             expect(actions[3].type).toBe(CHECKING_WPS_AVAILABILITY);
//             expect(actions[3].checking).toBe(false);

//             actions.slice(1, actions.length - 1).map((action) => {
//                 switch (action.type) {
//                 case SET_SERVICE:
//                     expect(action.service).toBe('wfs');
//                     break;
//                 case SET_WPS_AVAILABILITY:
//                     expect(action.value).toBe(true);
//                     break;
//                 default:
//                     break;
//                 }
//             });
//             done();
//         };

//         mockAxios.onGet().reply(200, xmlData);
//         const state = {
//             controls: {
//                 layerdownload: { enabled: false, downloadOptions: {}}
//             },
//             layers: {
//                 flat: [
//                     {
//                         type: 'wfs',
//                         visibility: true,
//                         id: 'mapstore:states__7',
//                         search: {
//                             url: 'http://u.r.l'
//                         }
//                     }
//                 ],
//                 selected: [
//                     'mapstore:states__7'
//                 ]
//             }
//         };
//         testEpic(checkWPSAvailabilityEpic, 4, checkWPSAvailability('http://check.wps.availability.url', 'wfs'), epicResult, state);
//     });

//     it('should select WPS service', (done) => {
//         const epicResult = actions => {
//             expect(actions.length).toBe(4);
//             actions.map((action) => {
//                 switch (action.type) {
//                 case SET_SERVICE:
//                     expect(action.service).toBe('wps');
//                     break;
//                 default:
//                     break;
//                 }
//             });
//             done();
//         };

//         mockAxios.onGet().reply(200, xmlData);
//         const state = {
//             controls: {
//                 layerdownload: { enabled: false, downloadOptions: {}}
//             },
//             layers: {
//                 flat: [
//                     {
//                         type: 'wms',
//                         visibility: true,
//                         id: 'mapstore:states__7'
//                     }
//                 ],
//                 selected: [
//                     'mapstore:states__7'
//                 ]
//             }
//         };
//         testEpic(checkWPSAvailabilityEpic, 4, checkWPSAvailability('http://check.wps.availability.url', 'wfs'), epicResult, state);
//     });
