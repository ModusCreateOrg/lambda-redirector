Lambda Redirector
=================
Redirect an entire website using AWS Lambda


To create a stack, edit variables in `run.sh` and run it:
``` bash
$ ./run.sh [STACK_NAME]
```
Where `STACK_NAME` is the name of the stack as read by CloudFormation. If the stack doesn't exist, it will be created.
**NOTE:** `STACK_NAME` is optional.

To delete a stack:
``` bash
$ ./run.sh delete STACK_NAME
```