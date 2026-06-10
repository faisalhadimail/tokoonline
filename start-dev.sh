#!/bin/bash
unset DATABASE_URL
unset DIRECT_URL
cd /home/z/my-project
exec bun run dev
