---
layout: post
title:  "Sending Emails with Attachments using Python"
date:   2019-05-24
tags: python email
---

Recently at work, I was tasked with periodically sending a list of file contents to certain groups so that they can keep track of the data they have submitted to us.  Obviously this task would be a pain if I had to send the emails manually, but fortunately modern languages typically have packages or modules to send an email, given a few configurations.  A long time ago (with the aid of Google and Stack Overflow) I wrote scripts in Bash and Perl to send emails, but for this situation I elected to go with Python.

The objective of this task is to go thorough a list of files present in a text file and determine which user the file is associated with based on a simple pattern.  Once determined, the files are stored in a dictionary where the user name is the key, and for each key an email is sent to that user, providing the user's list of files as a gzipped attachment.

Two things worth noting:
* This script is a simplified version of a script I wrote for my workplace, so there are probably some aspects that can be improved (such as consolidating the dicttionaries using the user's name as key into a nested dict.)
* The workplace script actually uses a nested dict structure to send an email to a user based on sub-categories, each with their own pattern.  Each sub-category gets its own attachment, and I will briefly explain how you would do that.

Lastly I would also like to cite (this article from Real Python)[https://realpython.com/python-send-email/] which helped me a lot in setting up the email portion of my script.

Let's get started...

```python
# general modules
from argparse import ArgumentParser
import sys
import datetime
import gzip
from collections import defaultdict

# email modules
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib  # Simple Mail Transfer Protocol
import ssl
```
The modules that I import can be broken into two seperate categories: general modules and email-specific modules.  As part of a Python template, I also import the "logging" module but it is not relevant for the script.  The "gzip" module is imported to compress the attachments, and "datetime" is important to create a timestamp for the email subject line and attachment file name.

```python
port = 587
smtp_server = 'smtp.office365.com'
sender_email = "test@outlook.com"
password = input("Type your password and press enter: ")
```
For my "sender_email" variable, I used Outlook's services, which influences the "smtp_server" and "port" variables.  These variables will change depending on the email client used to send emails from.  For the "password" variable, we rely on the user to input it via the terminal... however if you are worried about your password being vislble on the terminal, adding the "getpass" module will make the screen input "blind".

```python
TODAY = datetime.date.today()
```

I just store today's date in a variable.  Beats having to type "datetime.date.today()" every time I need the timestamp

```python
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
```

Two different dictionaries were initialized, and both use the same key type.  A nested dictionary would have worked just fine here but since I only cared about two different sets of values for each key, I just decided to make two separate dicts instead.  The values for the first dictionary (user_ptrns) represent the portion of each filepath within the input list file that will be unique to that files for that person.  The values for the second dictionary are the email addresses associated with that person.

```python
inv_dict = defaultdict(list)

def handle_inv_line(line):
    """Determine user from the line in the inventory list and store in list."""
    # Build dict of file info by user
    for user, line in user_ptrns.items():
        if ptrn in line:
            inv_dict[user].append(line)
            return
    print("Could not discern user from line '{}'".format(line), file=sys.stderr)
    
def main():
    ### ARG-PARSING CODE OMITTED ###
    print("Categorizing files in inventory list")
    with open(args.inventory_file) as inv_fh:
        for line in inv_fh:
            line = line.rstrip()
            handle_inv_line(line)
```

Each line in the input list file is checked for any pattern in the user_ptrns dictionary, and if a match is found, that line is associated with the user inside of a list that serves as a value of a defaultdict.  Once the file has been associated with a user, there is no need to loop over user_ptrns anymore so we break out of the loop with a simple "return".

```python
def main():
    ### ARG-PARSING AND INVENTORY CATEGORIZING ALREADY PERFORMED ###
    
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
```

After categorizing every file with a certain user, it's now time to send emails to each user.  First some SSL connection default settings are created, and an SMTP server object is created, and logged into using my credentials.  For reference the credential variables were posted in an earlier code block.

Next the defaultdict containing the file inventory by user is iterated through.  A simple e-mail body message string is created just listing the user's name and the number of files associated with them.  All of the files in the user's file inventory list are used to create a newline-separated string that will be sent in the e-mail as an attachment.

When all the e-mails have been sent, or there is a failure of some sorts the server object is set to quit.

```python
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
```

This function is called in the previous code-block's "try" block to compose the attachment.  I choose to send the attached text file in GZip format, since the attachment size may be too large uncompressed depending on how many files are in the attachment.  If the GZip file is still too large to send as an attachment, then it may be time to consider another approach to deliver this information.  Since this email is going out on a weekly basis, I like to include the date in the email in case the user is keeping track of file additions or changes.

```python
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
```

For creating the e-mail itself, we need to create a MIMEMultipart() object, fill out the "From", "To", and "Subject' properties, attach both the message body and the attachment file.  Once this is complete, the email is officially sent out.

As a reference the entire script is listed below.

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

# email modules
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
