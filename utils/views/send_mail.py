import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


class NotifySendApi:


    def send_mail(self, To, From: str, subject: str, body: str) -> None:
        msg = MIMEMultipart()
        msg['To'] = To
        msg["From"] = f'{From}'
        msg['Subject'] = subject
        body = MIMEText(body)
        msg.attach(body)
        with smtplib.SMTP(host='viruswall.mgi.de') as connection:
            connection.starttls()
            connection.sendmail(from_addr=msg["From"], to_addrs=[addr for addr in msg["To"].split(';') if addr], msg=msg.as_string())
            print("done!")

if __name__ == "__main__":
    ...