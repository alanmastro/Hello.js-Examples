var helloApp = angular.module('helloApp', ['ngPrettyJson']);

helloApp.run(function() {
    hello.init({
        facebook: '210641105765847',
        instagram: 'fc65ed255535461f89048a88735846a1',
        flickr: '3ea86a3e6b1e167680797d8ebfd525eb',
        google: '1072689331864-6fsm2131n4usogovpoektqvpemhjihcf.apps.googleusercontent.com'
    }, {
        scope: 'friends,photos,email',
        redirect_uri: 'redirect.html'
    });
});

helloApp.controller('mainController', ['$scope', function($scope) {
    $scope.loginStatus = {facebook: false, instagram: false, flickr: false};
    $scope.imagesList = [];
    $scope.returnJson = '';
    $scope.errorMessage = '';

    $scope.socialLogin = function(provider) {
        hello(provider).login({force: false}).then(function() {
            hello(provider).api('me').then(function(json) {
                $scope.returnJson = json;
                $scope.loginStatus[provider] = true;
                $scope.errorMessage = '';
                $scope.$apply();
            }, function(e) {
                $scope.errorMessage = e.error.message;
                $scope.$apply();
            });
        }, function(e) {
            $scope.errorMessage = e.error.message;
            $scope.$apply();
        });
    };

    $scope.socialLogout = function(provider) {
        hello(provider).logout().then(function() {
            $scope.loginStatus[provider] = false;
            $scope.errorMessage = '';
            $scope.$apply();
        }, function(e) {
            $scope.errorMessage = e.error.message;
            $scope.$apply();
        });
    };

    $scope.getPhotos = function(provider, userId) {
        var apiCall = (userId !== undefined) ? 'friend/photos' : 'me/photos';
        var apiParams = (userId !== undefined) ? {id: userId} : {};

        hello(provider).api(apiCall, apiParams).then(function(json) {
            $scope.errorMessage = '';

            if (provider == 'facebook') {
                async.map(json.data, function (photo, mapCb) {
                    hello(provider).api('me/photo', {id: photo.id, fields: 'images,picture,from,album'}).then(
                        function(result) {
                            photo.pictures = result.images;
                            photo.picture = result.images[0].source;
                            photo.thumbnail = result.picture;
                            photo.album = result.album || {};
                            photo.from = result.from;
                            mapCb(null, photo);
                        },
                        function(err) {
                            mapCb(err, photo);
                        }
                    );
                }, function() {
                    $scope.returnJson = json;
                    $scope.parseThumbnailStructure(json.data);
                    $scope.$apply();
                });
            } else {
                $scope.returnJson = json;
                $scope.parseThumbnailStructure(json.data);
                $scope.$apply();
            }
        }, function(e) {
            $scope.errorMessage = e.error.message;
            $scope.$apply();
        });
    };

    $scope.getAlbums = function(provider) {
        hello(provider).api('me/albums').then(function(json) {
            $scope.returnJson = json;
            $scope.errorMessage = '';
            $scope.parseThumbnailStructure(json.data);
            $scope.$apply();
        }, function(e) {
            $scope.errorMessage = e.error.message;
            $scope.$apply();
        });
    };

    $scope.getFriends = function(provider) {
        hello(provider).api('me/friends', {limit: 10}).then(function(json) {
            $scope.returnJson = json;
            $scope.errorMessage = '';
            $scope.parseThumbnailStructure(json.data);
            $scope.$apply();
        }, function(e) {
            $scope.errorMessage = e.error.message;
            $scope.$apply();
        });
    };

    $scope.parseThumbnailStructure = function(items) {
        $scope.imagesList = [];

        items.forEach(function(item) {
            if (item.thumbnail !== undefined) {
                $scope.imagesList.push(item.thumbnail);
            }
        });
    }
}]);