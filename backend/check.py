import sqlite3
import pprint

conn = sqlite3.connect('test.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()
c.execute("SELECT * FROM users")
users = [dict(r) for r in c.fetchall()]
for u in users:
    if u['email'] == 'dhivagar0506@gmail.com':
        print("Our User:")
        pprint.pprint(u)

c.execute("SELECT * FROM technicians")
techs = [dict(r) for r in c.fetchall()]
print(f"Total technicians: {len(techs)}")
print("\nTechnicians:")
pprint.pprint(techs)

conn.close()
