import expect from "expect";
import serverbackup, {reset} from "../serverbackup";
import {getSessionName} from "../browser";

import axios from "../../../libs/ajax";
import ConfigUtils from "../../../utils/ConfigUtils";
import MockAdapter from "axios-mock-adapter";

describe('usersession API serverbackup implementation', () => {
    let mockAxios;
    const saved = {myprop: "myvalue"};
    beforeEach(() => {
        ConfigUtils.setConfigProp("userSessions", {
            enabled: true,
            backupFrequency: 2
        });
        mockAxios = new MockAdapter(axios);
        reset();
    });
    afterEach(() => {
        mockAxios.restore();
        ConfigUtils.setConfigProp("userSessions", {
            enabled: false
        });
    });
    it('get session by name', (done) => {
        localStorage.setItem(getSessionName("myname"), JSON.stringify(saved));
        mockAxios.onGet("misc/category/name/USERSESSION/resource/name/myname/data").reply(200, saved);
        mockAxios.onGet().reply(200, {
            Resource: {
                id: "1"
            }
        });
        serverbackup.getSession("myname").subscribe(([readId, session]) => {
            expect(readId.local).toBe("myname");
            expect(readId.remote).toBe("1");
            expect(session.myprop).toBe("myvalue");
            done();
        });
    });
    it('new session write, by name, only on local', (done) => {
        serverbackup.writeSession(null, "myname", "myuser", {myprop: "myvalue"}).subscribe((id) => {
            expect(id.local).toBe("myname");
            expect(id.remote).toNotExist();
            done();
        });
    });
    it('new session write, by name, on local and server', (done) => {
        reset(2);
        mockAxios.onPost().reply(200, "1");
        mockAxios.onGet().reply(200, {
            Resource: {
                id: "1"
            }
        });
        serverbackup.writeSession(null, "myname", "myuser", {myprop: "myvalue"}).subscribe((id) => {
            expect(id.local).toBe("myname");
            expect(id.remote).toBe(1);
            done();
        });
    });
    it('update session, by id, only local', (done) => {
        serverbackup.writeSession({
            local: "1"
        }, "myname", null, {myprop: "myvalue"}).subscribe((id) => {
            expect(id.local).toBe("1");
            expect(id.remote).toNotExist();
            done();
        });
    });
    it('update session, by id, local and remote', (done) => {
        reset(2);
        mockAxios.onPut().reply(200, "1");
        mockAxios.onGet().reply(200, {
            Resource: {
                id: "1"
            }
        });
        serverbackup.writeSession({
            local: "1",
            remote: "1"
        }, "myname", null, {myprop: "myvalue"}).subscribe((id) => {
            expect(id.local).toBe("1");
            expect(id.remote).toBe("1");
            done();
        });
    });
    it('remove session, only local', (done) => {
        serverbackup.removeSession({
            local: "1"
        }).subscribe(([local]) => {
            expect(local).toBe("1");
            done();
        });
    });
    it('remove session, local and remote', (done) => {
        reset(2);
        mockAxios.onDelete().reply(200, "1");
        mockAxios.onGet().reply(200, {
            Resource: {
                id: "1"
            }
        });
        serverbackup.removeSession({
            local: "1",
            remote: "1"
        }).subscribe(([local, remote]) => {
            expect(local).toBe("1");
            expect(remote).toBe(1);
            done();
        });
    });
});
