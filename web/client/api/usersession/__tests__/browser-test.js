import expect from "expect";
import browser from "../browser";

describe('usersession API browser implementation', () => {
    it('new session write, by name', (done) => {
        browser.writeSession(null, "myname", null, {myprop: "myvalue"}).subscribe((id) => {
            expect(id).toBe("myname");
            browser.getSession(id).subscribe(([readId, session]) => {
                expect(readId).toBe("myname");
                expect(session.myprop).toBe("myvalue");
                done();
            });
        });
    });
    it('update session, by id', (done) => {
        browser.writeSession("1", null, null, {myprop: "myvalue"}).subscribe((id) => {
            expect(id).toBe("1");
            browser.getSession(id).subscribe(([readId, session]) => {
                expect(readId).toBe("1");
                expect(session.myprop).toBe("myvalue");
                done();
            });
        });
    });
    it('remove session', (done) => {
        browser.writeSession(null, "myname", null, {myprop: "myvalue"}).subscribe((id) => {
            expect(id).toBe("myname");
            browser.removeSession(id).subscribe(() => {
                browser.getSession(id).subscribe(([readId, session]) => {
                    expect(readId).toNotExist();
                    expect(session).toNotExist();
                    done();
                });
            });
        });
    });
});
