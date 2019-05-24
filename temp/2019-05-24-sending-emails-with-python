---
layout: post
title:  "Sending Emails with Attachments using Python"
date:   2019-05-24
tags: python email
---

```python
#!/usr/bin/env python

"""
quarterly_inventory.py

This script sends out an email to each user on a quarterly basis.  Inside the email is a gzipped attachment 
containing an inventory list of all files whose directory structure matches a naming pattern attributed to the user.

By: Shaun Adkins
"""

# vim: tabstop=8 expandtab shiftwidth=4 softtabstop=4

from argparse import ArgumentParser
import sys
import logging
import datetime
import gzip
from collections import defaultdict

# email packages
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib  # Simple Mail Transfer Protocol
import ssl

port = 587
smtp_server = 'smtp.office365.com'
sender_email = "test@outlook.com"
password = input("Type your password and press enter: ")

TODAY = datetime.date.today()

inv_dict = defaultdict(list)

user_ptrns = {
    'alice':'alice/foo',
    'bob':'bob/bar',
    'charles':'charles/baz',
    'donna':'donna/qux'
}

user_emails = {
    'alice':"alice@test.email",
    'bob':"bob@test.email",
    'charles':"charles@test.email",
    'donna':"donna@test.email"
}

def compose_email(server, user, body, attachment):
    """Send email with generated reports."""
    # Create a multipart message and set headers
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = user_emails[user]
    message["Subject"] = "{} - {} Quarterly Inventory.".format(TODAY, user.upper())
    message.attach(MIMEText(body))

    # Add attachment
    message.attach(attachment)

    # Send e-mail to user
    server.sendmail(sender_email, user_emails[user], message.as_string())


def create_attachment(user, body):
    """Create an attachment file."""
    name = "{}-{}-inventory.txt.gz".format(TODAY, user)

    # body is encoded into bytes, then compressed with gzip
    part = MIMEApplication(
        gzip.compress(str.encode(body)),
        "gzip",
        Name=name
    )
    # After the file is closed
    part['Content-Disposition'] = 'attachment; filename="{}"'.format(name)
    return part


def handle_inv_line(line):
    """Determine user from the line in the inventory list and store in list."""
    # Build dict of file info by user
    for user, line in user_ptrns.items():
        if ptrn in line:
            inv_dict[user].append(line)
            return
    print("Could not discern user from line '{}'".format(line), file=sys.stderr)

########
# Main #
########

def main():
    # Set up options parser and help statement
    description = "Organize inventory list by user based on naming patterns in filepath and send inventory to users on a periodic basis"
    parser = ArgumentParser(description=description)
    parser.add_argument("--inventory_file", "-i", help="Path to read the inventory (.lst) file", metavar="/path/to/inventory.lst", required=True)
    parser.add_argument("--debug", help="Set the debug level", default="ERROR", metavar="DEBUG/INFO/WARNING/ERROR/CRITICAL")
    args = parser.parse_args()
    check_args(args, parser)


    print("Categorizing files in inventory list")
    with open(args.inventory_file) as inv_fh:
        for line in inv_fh:
            line = line.rstrip()
            handle_inv_line(line)

    # Create a secure SSL context
    context = ssl.create_default_context()

    print("Composing and sending email reports and attachments...")
    # Try to log in to server and send email
    try:
        server = smtplib.SMTP(smtp_server,port)
        server.starttls(context=context) # Secure the connection
        server.login(sender_email, password)
        for user, inv in inv_dict.items():
            report_body = "{} (total - {})".format(user.title(), len(inv))
            attachment_body = "\n".join(inv)
            attachment = create_attachment(user, attachment_body)
            compose_email(server, user, report_body, attachment)
    except Exception as e:
        # Print any error messages to stdout
        print(e)
    finally:
        server.quit()

def check_args(args, parser):
    """ Validate the passed arguments """
    log_level = args.debug.upper()
    num_level = getattr(logging, log_level)

    # Verify that our specified log_level has a numerical value associated
    if not isinstance(num_level, int):
        raise ValueError('Invalid log level: %s' % log_level)

    # Create the logger
    logging.basicConfig(level=num_level)

if __name__ == '__main__':
    main()
    sys.exit(0)
```
