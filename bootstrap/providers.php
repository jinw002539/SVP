<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\UploadsDiskServiceProvider;

return [
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    UploadsDiskServiceProvider::class,
];