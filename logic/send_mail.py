import smtplib
from os.path import basename
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText


import logging
logger = logging.getLogger("main")



def send_mail(From: str, To: list, subject:str, html: str, Cc=[], files=[]) -> None:
    HOST = 'viruswall.mgi.de'
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg["From"] = f'{From}'
    msg["To"] = ",".join(To)
    msg["Cc"] = ",".join(Cc)

    content = MIMEText(html, "html")
    msg.attach(content)
    logger.warning(1)
    for file in files:
        with open(file, 'rb') as f:
            part = MIMEApplication(f.read())
        part['Content-Disposition'] = f'attachment; filename="{file}"'
        msg.attach(part)

    logger.warning(1)
    with smtplib.SMTP(host=HOST) as connection:
        connection.starttls()
        connection.sendmail(
                            from_addr=From,
                            to_addrs=To+Cc,
                            msg=msg.as_string(),
                            )
        




