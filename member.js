function skillsMember() {
    return {
        restrict: 'E',
        scope: {
            member: '='
        },
        templateUrl: 'app/components/skills/member.html',
        controller: function ($scope) {
            $scope.member = $scope.member;
        }
    };
}