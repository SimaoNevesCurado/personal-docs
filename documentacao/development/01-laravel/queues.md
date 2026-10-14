# Queues/Jobs

Job is a task encapsulated in a class. A Queue is a collection of jobs that are processed in the background.
A Job can be processed immediately or queued for later processing.

With this we prevent the user from waiting for the job to be processed.

For example when an email is sent withouth a queue, the user must wait for the email to be sent before continuing.

Job can be used to:

- send emails
- process an image
- import a CSV file
- generate a PDF/report
- comunicate with an external API
- fetch data
- send a notifications

## Create a job

A Job can be created using the `php artisan make:job` command.


This will create a new Job class under the `app/Jobs` directory.


```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ImportAssets implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $filePath,
    ) {}

    public function handle(): void
    {
        // Executes
    }
}
```

### ShouldQueue

`ShouldQueue` is an interface that must be implemented by the Job class.
It tells Laravel that the job should be queued for later processing.

With queues, the job can be stored in a system like:

- Redis
- Beanstalk
- SQS
- Database

And then processed by a worker.

### Dispatch

To execute a job, you can use the `dispatch` method.

```php
ImportAssets::dispatch($filePath);
```

The arguments passed to `dispatch` are passed to the Job constructor.

```php
public function __construct(
    public string $filePath,
) {}
```
