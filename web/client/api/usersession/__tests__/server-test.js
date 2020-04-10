import expect from "expect";
import server from "../server";

import axios from "../../../libs/ajax";
import MockAdapter from "axios-mock-adapter";

describe('usersession API server implementation', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });
    it('get session by name', (done) => {
        mockAxios.onGet("misc/category/name/USERSESSION/resource/name/myname/data").reply(200, {myprop: "myvalue"});
        mockAxios.onGet().reply(200, {
            Resource: {
                id: "1"
            }
        });
        server.getSession("myname").subscribe(([readId, session]) => {
            expect(readId).toBe("1");
            expect(session.myprop).toBe("myvalue");
            done();
        });
    });
    it('new session write, by name', (done) => {
        mockAxios.onPost().reply(200, "1");
        mockAxios.onGet().reply(200, {
            Resource: {
                id: "1"
            }
        });
        server.writeSession(null, "myname", "myuser", {myprop: "myvalue"}).subscribe((id) => {
            expect(id).toBe(1);
            expect(mockAxios.history.post[0].data).toContain("<name><![CDATA[myname]]></name>");
            expect(mockAxios.history.post[0].data).toContain("<value>myuser</value>");
            done();
        });
    });
    it('update session, by id', (done) => {
        mockAxios.onPut().reply(200, "1");
        mockAxios.onGet().reply(200, {
            Resource: {
                id: "1"
            }
        });
        server.writeSession("1", "myname", null, {myprop: "myvalue"}).subscribe((id) => {
            expect(id).toBe("1");
            done();
        });
    });
    it('remove session', (done) => {
        mockAxios.onDelete().reply(200, "1");
        mockAxios.onGet().reply(200, {
            Resource: {
                id: "1"
            }
        });
        server.removeSession("1").subscribe((id) => {
            expect(id).toBe(1);
            done();
        });
    });
});
