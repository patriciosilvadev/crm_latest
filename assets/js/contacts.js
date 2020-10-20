function Contacts_Controller($scope, $http, $mdSidenav, $filter,$mdDialog,fileUpload) {
	"use strict";

	$http.get(BASE_URL + 'api/custom_fields_by_type/' + 'task').then(function (custom_fields) {
		$scope.all_custom_fields = custom_fields.data;
		$scope.custom_fields = $filter('filter')($scope.all_custom_fields, {
			active: 'true',
		});
	});
	$scope.Update = buildToggler('Update');

	
	
	

	$scope.toggleFilter = buildToggler('ContentFilter');
	$scope.Create = buildToggler('Create');

	$scope.get_staff();
	 $scope.whatClassIsIt= function(someValue){
	 
         if(someValue=="Low")
                return "text-info badge"
         else if(someValue=="Medium")
             return "text-success badge";
        else
             return "text-danger badge";
    }

	function buildToggler(navID) {
		return function () {
			$mdSidenav(navID).toggle();

		};
	}
	$scope.close = function () {
		$mdSidenav('ContentFilter').close();
		$mdSidenav('Create').close();
	};
	$scope.task_list = {
		order: '',
		limit: 10,
		page: 1
	};
	
	$scope.open_contact_type = function (type) {
		$http.get(BASE_URL + 'contacts/contacttype').then(function (Payroll) {
			$scope.contacttype = Payroll.data;
		});
	}
    $scope.open_contact_type();
	$scope.taskLoader = true;
	
	$scope.open_students = function (type) {
		$scope.setBold = type;
		$scope.staff_list = {
		order: '',
		limit: 20,
		page: 1
	};
	$http.get(BASE_URL + 'contacts/get_tasks/'+ type).then(function (Tasks) {
		$scope.tasks = Tasks.data;
		
		$scope.limitOptions = [10, 15, 20];
		if ($scope.tasks.length > 20) {
			$scope.limitOptions = [10, 15, 20, $scope.tasks.length];
		}
		$scope.taskLoader = false;

		$scope.Relation_Type = 'project';
		$scope.saving = false;
		$scope.AddTask = function () {
			console.log($scope);return false;
			$scope.saving = true;
			if ($scope.isPublic === true) {
				$scope.isPublicValue = 1;
			} else {
				$scope.isPublicValue = 0;
			}
			if ($scope.isBillable === true) {
				$scope.isBillableValue = 1;
			} else {
				$scope.isBillableValue = 0;
			}
			if ($scope.isVisible === true) {
				$scope.isVisibleValue = 1;
			} else {
				$scope.isVisibleValue = 0;
			}
			// if (!$scope.RelatedTicket) {
			// 	$scope.related_with = '';
			// } else {
			// 	if ($scope.Relation_Type === 'ticket') {
			// 		$scope.related_with = $scope.RelatedTicket.id;
			// 	}
			// }
			if ($scope.Relation_Type === 'project') {
				if (!$scope.RelatedProject) {
					$scope.related_with = '';
				} else {
					$scope.related_with = $scope.RelatedProject.id;
				}
			}
			$scope.tempArr = [];
			angular.forEach($scope.custom_fields, function (value) {
				if (value.type === 'input') {
					$scope.field_data = value.data;
				}
				if (value.type === 'textarea') {
					$scope.field_data = value.data;
				}
				if (value.type === 'date') {
					$scope.field_data = moment(value.data).format("YYYY-MM-DD");
				}
				if (value.type === 'select') {
					$scope.field_data = JSON.stringify(value.selected_opt);
				}
				$scope.tempArr.push({
					id: value.id,
					name: value.name,
					type: value.type,
					order: value.order,
					data: $scope.field_data,
					relation: value.relation,
					permission: value.permission,
				});
			});
			if (!$scope.task) {
				var dataObj = $.param({
					name: '',
					hourly_rate: '',
					assigned: '',
					priority: '',
					relation_type: $scope.Relation_Type, 
					relation: $scope.related_with,
					milestone: '',
					status_id: '',
					public: '',
					billable: '',
					visible: '',
					startdate: '',
					duedate: '',
					description: '',
					custom_fields: $scope.tempArr,
				});
			} else {
				if ($scope.task.startdate) {
					$scope.task.startdate = moment($scope.task.startdate).format("YYYY-MM-DD");
				}
				if ($scope.task.duedate) {
					$scope.task.duedate = moment($scope.task.duedate).format("YYYY-MM-DD");
				}
				var dataObj = $.param({
					name: $scope.task.name,
					keywords: $scope.task.keywords,
					hourly_rate: $scope.task.hourlyrate,
					assigned: $scope.task.assigned,
					priority: $scope.task.priority_id,
					relation_type: $scope.Relation_Type, 
					relation: $scope.related_with,
					milestone: $scope.SelectedMilestone,
					status_id: $scope.task.status_id,
					public: $scope.isPublicValue,
					billable: $scope.isBillableValue,
					visible: $scope.isVisibleValue,
					startdate: $scope.task.startdate,
					duedate: $scope.task.duedate,
					description: $scope.task.description,
					custom_fields: $scope.tempArr,
				});
			}
			var posturl = BASE_URL + 'tasks/create/';
			$http.post(posturl, dataObj, config)
				.then(
					function (response) {
						if (response.data.success == true) {
							window.location.href = BASE_URL + 'tasks/task/' + response.data.id;
						} else {
							$scope.saving = false;
							globals.mdToast('error', response.data.message );
						}						
					},
					function (response) {
						$scope.saving = false;
					}
				);
		};

		$scope.filter = {};
		$scope.getOptionsFor = function (propName) {
			return ($scope.tasks || []).map(function (item) {
				return item[propName];
			}).filter(function (item, idx, arr) {
				return arr.indexOf(item) === idx;
			}).sort();
		};

		$scope.FilteredData = function (item) {
			// Use this snippet for matching with AND
			var matchesAND = true;
			for (var prop in $scope.filter) {
				if (noSubFilter($scope.filter[prop])) {
					continue;
				}
				if (!$scope.filter[prop][item[prop]]) {
					matchesAND = false;
					break;
				}
			}
			return matchesAND;

		};

		function noSubFilter(subFilterObj) {
			for (var key in subFilterObj) {
				if (subFilterObj[key]) {
					return false;
				}
			}
			return true;
		}
		// Filtered Datas
		$scope.search = {
			keywords: '',
		};

	});
	}
	$scope.open_students(0);

	$http.get(BASE_URL + 'api/projects').then(function (Projects) {
		$scope.projects = Projects.data;
	});

	$http.get(BASE_URL + 'api/milestones').then(function (Milestones) {
		$scope.milestones = Milestones.data;
	});
	
	
	
}

function Contact_Controller($scope, $http, $mdSidenav, $mdDialog, fileUpload,$timeout) {
	"use strict";

	$scope.Update = buildToggler('Update');

	function buildToggler(navID) {
		return function () {
			$mdSidenav(navID).toggle();
		};
	}

	//$scope.get_staff();
	$scope.ViewPdfFile = function(index, image) {	
			var id = $scope.files[index];
			var filepath=id.path;
			var fileid=id.id;
			//var buton='<a href="'+BASE_URL +'estimations/delete_file/'+ fileid+'">Delete<button></a>';
			var buton='  <a href="'+BASE_URL+'contacts/download/'+fileid+'" aria-label="add" class="btn btn-primary btn-lg">Download!</a>';
			$('#buttons').html(buton);
			$('#imagepdf').attr('src',filepath);
			$('#myModal').modal('show');
		}
$scope.ViewPdfFiledoc = function(index, image) {	
			var id = $scope.files1[index];
			var filepath=id.path;
			var fileid=id.id;
			//var buton='<a href="'+BASE_URL +'estimations/delete_file/'+ fileid+'">Delete<button></a>';
			var buton='  <a href="'+BASE_URL+'contacts/download/'+fileid+'" aria-label="add" class="btn btn-primary btn-lg">Download!</a>';
			$('#buttons').html(buton);
			$('#imagepdf').attr('src',filepath);
			$('#myModal').modal('show');
		}
	$scope.close = function () {
		$mdSidenav('Update').close();
		$mdDialog.hide();
	};

	 $scope.title = 'Sub Tasks';

	$scope.UploadFile = function (ev) {
		$mdDialog.show({
			templateUrl: 'addfile-template.html',
			scope: $scope,
			preserveScope: true,
			targetEvent: ev
		});
	};
	$scope.UploadFileDoc = function (ev) {
		$mdDialog.show({
			templateUrl: 'addfile-template.html',
			scope: $scope,
			preserveScope: true,
			targetEvent: ev
		});
	};
	$http.get(BASE_URL + 'api/doclogs/'+TASKID+'/" "/Document').then(function (Logs) {
		$scope.logs = Logs.data;
	});
	$scope.loadMoreLogs = function() {
		$scope.getLogs = true;
		$http.get(BASE_URL + 'api/doclogs/'+TASKID+'/loadMore/Document').then(function (Logs) {
			$scope.logs = Logs.data;
			$scope.getLogs = false;
		});
	}

$scope.projectFiles = true;
	$http.get(BASE_URL + 'contacts/projectfiles/' + TASKID).then(function (Files) {
		$timeout(function(){
			$scope.files = Files.data;
			$scope.projectFiles = false;
			
		$scope.itemsPerPage = 4;
		$scope.currentPage = 0;
		$scope.range = function () {
			var rangeSize = 4;
			var ps = [];
			var start;

			start = $scope.currentPage;
			if (start > $scope.pageCount() - rangeSize) {
				start = $scope.pageCount() - rangeSize + 1;
			}
			for (var i = start; i < start + rangeSize; i++) {
				if (i >= 0) {
					ps.push(i);
				}
			}
			return ps;
		};
		$scope.prevPage = function () {
			if ($scope.currentPage > 0) {
				$scope.currentPage--;
			}
		};
		$scope.DisablePrevPage = function () {
			return $scope.currentPage === 0 ? "disabled" : "";
		};
		$scope.nextPage = function () {
			if ($scope.currentPage < $scope.pageCount()) {
				$scope.currentPage++;
			}
		};
		$scope.DisableNextPage = function () {
			return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
		};
		$scope.setPage = function (n) {
			$scope.currentPage = n;
		};
		$scope.pageCount = function () {
			return Math.ceil($scope.files.length / $scope.itemsPerPage) - 1;
		};
		
		$scope.ViewFile = function(index, image) {
			$scope.file = $scope.files[index];
			$mdDialog.show({
				templateUrl: 'view_image.html',
				scope: $scope,
				preserveScope: true,
				targetEvent: $scope.file.id
			});
		}
		},500);
		


		$scope.DeleteFile = function(id) {
			var confirm = $mdDialog.confirm()
				.title($scope.lang.delete_file_title)
				.textContent($scope.lang.delete_file_message)
				.ariaLabel($scope.lang.delete_file_title)
				.targetEvent(TASKID)
				.ok($scope.lang.delete)
				.cancel($scope.lang.cancel);

			$mdDialog.show(confirm).then(function () {
				var config = {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
					}
				};
				$http.post(BASE_URL + 'contacts/delete_file/' + id, config)
					.then(
						function (response) {
							if(response.data.success == true) {
								showToast(NTFTITLE, response.data.message, ' success');
								$http.get(BASE_URL + 'contacts/projectfiles/' + TASKID).then(function (Files) {
									$scope.files = Files.data;
								});
							} else {
								showToast(NTFTITLE, response.data.message, ' danger');
							}
						},
						function (response) {
							console.log(response);
						}
					);

			}, function() {
				//
			});
		};
	});

$scope.documentFiles = true;
	$http.get(BASE_URL + 'document/documentdocfiles/' + TASKID).then(function (Files) {
		$("#loader-wrapper").hide();
		$timeout(function(){
			$scope.files1 = Files.data;
			$scope.documentFiles = false;
			$scope.itemsPerPage = 4;
			$scope.currentPage = 0;
			$scope.range = function () {
				var rangeSize = 4;
				var ps = [];
				var start;

				start = $scope.currentPage;
				if (start > $scope.pageCount() - rangeSize) {
					start = $scope.pageCount() - rangeSize + 1;
				}
				for (var i = start; i < start + rangeSize; i++) {
					if (i >= 0) {
						ps.push(i);
					}
				}
				return ps;
			};
			$scope.prevPage = function () {
				if ($scope.currentPage > 0) {
					$scope.currentPage--;
				}
			};
			$scope.DisablePrevPage = function () {
				return $scope.currentPage === 0 ? "disabled" : "";
			};
			$scope.nextPage = function () {
				if ($scope.currentPage < $scope.pageCount()) {
					$scope.currentPage++;
				}
			};
			$scope.DisableNextPage = function () {
				return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
			};
			$scope.setPage = function (n) {
				$scope.currentPage = n;
			};
			$scope.pageCount = function () {
				return Math.ceil($scope.files1.length / $scope.itemsPerPage) - 1;
			};
		
			$scope.ViewFiledoc = function(index, image) {
				$scope.file = $scope.files1[index];
				$mdDialog.show({
					templateUrl: 'view_image.html',
					scope: $scope,
					preserveScope: true,
					targetEvent: $scope.file.id
				});
			}
		},1000);
		$scope.DeleteDocFile = function(id) {
			var confirm = $mdDialog.confirm()
				.title($scope.lang.delete_file_title)
				.textContent($scope.lang.delete_file_message)
				.ariaLabel($scope.lang.delete_file_title)
				.targetEvent(TASKID)
				.ok($scope.lang.delete)
				.cancel($scope.lang.cancel);

			$mdDialog.show(confirm).then(function () {
				var config = {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
					}
				};
				$http.post(BASE_URL + 'document/delete_file/' + id, config)
					.then(
						function (response) {
							if(response.data.success == true) {
								showToast(NTFTITLE, response.data.message, ' success');
								$http.get(BASE_URL + 'document/documentdocfiles/' + TASKID).then(function (Files) {
									$scope.files1 = Files.data;
								});
							} else {
								showToast(NTFTITLE, response.data.message, ' danger');
							}
						},
						function (response) {
							console.log(response);
						}
					);

			}, function() {
				//
			});
		};
	});


	$http.get(BASE_URL + 'api/custom_fields_data_by_type/' + 'task/' + TASKID).then(function (custom_fields) {
		$scope.custom_fields = custom_fields.data;
	});

	$http.get(BASE_URL + 'tasks/get_task/' + TASKID).then(function (Task) {
		$scope.task = Task.data; 


		$scope.startTimerforTask = function () {
			var dataObj = $.param({
				task: TASKID,
				project: $scope.task.relation,
			}); 
			$http.post(BASE_URL + 'tasks/starttimer', dataObj, config)
				.then(
					function (response) {
						if(response.data.success == true) {
							$scope.task.timer = true;
							globals.mdToast('success', response.data.message);
							$('#stopTaskTimer').attr('style','display: block !important');
							$('#startTaskTimer').css('display', 'none');
							$scope.timer = {};
							$scope.timer.loading = true;
							$scope.timer.start = false;
							$scope.timer.stop = true;
							$scope.timer.found = false;
						} else {
							globals.mdToast('error', response.data.message);
						}
					},
					function (response) {
						console.log(response);
					}
				);
		};

		$scope.stopTimer = function () {
			$mdDialog.show({
		      	templateUrl: 'stopTimer.html',
		      	parent: angular.element(document.body),
		      	clickOutsideToClose: false,
		      	fullscreen: false,
		      	escapeToClose: false,
		      	controller: NewTeamDialogController,
		    });
		};

		function NewTeamDialogController($scope, $mdDialog) {  
			$scope.stopTimerforTask = function () {
				var note;
				if (!$scope.stopTimer) {
					note = '';
				} else {
					note = $scope.stopTimer.note;
				}
				var dataObj = $.param({
					task: TASKID,
					note: note
				});
				$http.post(BASE_URL + 'tasks/stoptimer', dataObj, config)
					.then(
						function (response) {
							if(response.data.success == true) {
								$mdDialog.hide();
								showToast(NTFTITLE, response.data.message, 'success');
								$('#stopTaskTimer').css('display', 'none');
								$('#startTaskTimer').attr('style','display: block !important');
								if (TASKID == $scope.timer.task_id) {
									$('#timerStarted').removeClass('text-success');
									$('#timerStarted').addClass('text-muted');
								}
							} else {
								globals.mdToast('error', response.data.message);
							}
						},
						function (response) {
							console.log(response);
						}
					);
			};
			$scope.close = function(){$mdDialog.hide();}
		}


		$scope.UpdateTask = function () {
			if ($scope.task.public === true) {
				$scope.isPublic = 1;
			} else {
				$scope.isPublic = 0;
			}
			if ($scope.task.visible === true) {
				$scope.isVisible = 1;
			} else {
				$scope.isVisible = 0;
			}
			if ($scope.task.billable === true) {
				$scope.isBillable = 1;
			} else {
				$scope.isBillable = 0;
			}
			$scope.tempArr = [];
			angular.forEach($scope.custom_fields, function (value) {
				if (value.type === 'input') {
					$scope.field_data = value.data;
				}
				if (value.type === 'textarea') {
					$scope.field_data = value.data;
				}
				if (value.type === 'date') {
					$scope.field_data = moment(value.data).format("YYYY-MM-DD");
				}
				if (value.type === 'select') {
					$scope.field_data = JSON.stringify(value.selected_opt);
				}
				$scope.tempArr.push({
					id: value.id,
					name: value.name,
					type: value.type,
					order: value.order,
					data: $scope.field_data,
					relation: value.relation,
					permission: value.permission,
				});
			});
			var dataObj = $.param({
				name: $scope.task.name,
				hourly_rate: $scope.task.hourlyrate,
				assigned: $scope.task.assigned,
				priority: $scope.task.priority_id,
				relation_type: $scope.task.relation_type,
				relation: $scope.task.relation,
				milestone: $scope.task.milestone,
				status_id: $scope.task.status_id,
				public: $scope.isPublic,
				billable: $scope.isBillable,
				visible: $scope.isVisible,
				startdate: moment($scope.task.startdate_edit).format("YYYY-MM-DD"),
				duedate: moment($scope.task.duedate_edit).format("YYYY-MM-DD"),
				description: $scope.task.description,
				custom_fields: $scope.tempArr,
			});
			var posturl = BASE_URL + 'tasks/update/' + TASKID;
			$http.post(posturl, dataObj, config)
				.then(
					function (response) {
						if(response.data.success == true) {
							$mdSidenav('Update').close();
							globals.mdToast('success', response.data.message);
							$http.get(BASE_URL + 'tasks/get_task/' + TASKID).then(function (Task) {
								$scope.task = Task.data;
							});
						} else {
							$mdSidenav('Update').close();
							globals.mdToast('error', response.data.message );
						}
					},
					function (response) {
						console.log(response);
					}
				);
		};

		$scope.Delete = function (index) {
			globals.deleteDialog(lang.attention, lang.delete_task, TASKID, lang.doIt, lang.cancel, 'tasks/remove/' + TASKID, function(response) {
				if (response.success == true) {
					globals.mdToast('success',response.message);
					window.location.href = BASE_URL + 'tasks';
				} else {
					globals.mdToast('error',response.message);
				}
			});
		};
	});

	$http.get(BASE_URL + 'tasks/tasktimelogs/' + TASKID).then(function (TimeLogs) {
		$scope.timelogs = TimeLogs.data;
		$scope.getTotal = function () {
			var total = 0;
			for (var i = 0; i < $scope.timelogs.length; i++) {
				var timelog = $scope.timelogs[i];
				total += (timelog.timed);
			}
			return total;
		};
		$scope.ProjectTotalAmount = function () {
			var total = 0;
			for (var i = 0; i < $scope.timelogs.length; i++) {
				var timelog = $scope.timelogs[i];
				total += (timelog.amount);
			}
			return total;
		};
	});

	$http.get(BASE_URL + 'api/milestones').then(function (Milestones) {
		$scope.milestones = Milestones.data;
	});

	$scope.uploading = false; 
	$scope.uploadProjectFile = function() {
		//alert("1`2`1");
		$scope.uploading = true;
        var file = $scope.project_file;
        var uploadUrl = BASE_URL+'contacts/add_file/'+TASKID;
        fileUpload.uploadFileToUrl(file, uploadUrl, function(response) {
        	if (response.success == true) {
        		globals.mdToast('success', response.message);
        	} else {
        		globals.mdToast('error', response.message);
        	}
        	$scope.projectFiles = true;
        	$http.get(BASE_URL + 'contacts/projectfiles/' + TASKID).then(function (Files) {
        		$scope.files = Files.data;
        		$scope.projectFiles = false;
        	});
        	$scope.uploading = false;
        	$mdDialog.hide();
        });
    };
	 
	/* $scope.uploadDocFile = function() {
		//alert("1`2`1");
		$scope.uploading = true;
        var file = $scope.project_file;
        var uploadUrl = BASE_URL+'document/add_file/'+TASKID;
		console.log(file);
        fileUpload.uploadFileToUrl(file, uploadUrl, function(response) {
        	if (response.success == true) {
        		globals.mdToast('success', response.message);
        	} else {
        		globals.mdToast('error', response.message);
        	}
        	$scope.documentFiles = true;
        	$http.get(BASE_URL + 'document/documentdocfiles/' + TASKID).then(function (Files) {
        		$scope.files = Files.data;
        		$scope.documentFiles = false;
        	});
        	$scope.uploading = false;
        	$mdDialog.hide();
        });
    }; */

	$scope.uploading = false; 
	$scope.uploadTaskFile = function() {
		$scope.uploading = true;
        var file = $scope.project_file;
        var uploadUrl = BASE_URL+'contacts/add_file/'+TASKID;
        fileUpload.uploadFileToUrl(file, uploadUrl, function(response) {
        	if (response.success == true) {
        		showToast(NTFTITLE, response.message, ' success');
        	} else {
        		showToast(NTFTITLE, response.message, ' danger');
        	}
        	$http.get(BASE_URL + 'contacts/taskfiles/' + TASKID).then(function (Files) {
        		$scope.files = Files.data;
        	});
        	$scope.uploading = false;
        	$mdDialog.hide();
        });
    };

	$http.get(BASE_URL + 'tasks/subtasks/' + TASKID).then(function (Subtasks) {
		$scope.subtasks = Subtasks.data;
		$scope.createTask = function () {
			var dataObj = $.param({
				description: $scope.newTitle,
				taskid: TASKID,
			});
			var posturl = BASE_URL + 'tasks/addsubtask';
			$http.post(posturl, dataObj, config)
				.then(
					function (response) {
						if(response.data.success == true) {
							$scope.subtasks.unshift({
								description: $scope.newTitle,
								date: Date.now()
							});
							$scope.newTitle = '';
							console.log(response);
						} else {
							globals.mdToast('error', response.data.message);
						}
					},
					function (response) {
						console.log(response);
					}
				);
		};

		$scope.removeTask = function (index) {
			var subtask = $scope.subtasks[index];
			var dataObj = $.param({
				subtask: subtask.id
			});
			$http.post(BASE_URL + 'tasks/removesubtasks', dataObj, config)
				.then(
					function (response) {
						if(response.data.success == true){
							$scope.subtasks.splice($scope.subtasks.indexOf(subtask), 1);
						} else {
							globals.mdToast('error', response.data.message);
						}
					},
					function (response) {
						console.log(response);
					}
				);
		};

		$scope.completeTask = function (index) {
			var subtask = $scope.subtasks[index];
			var dataObj = $.param({
				subtask: subtask.id
			});
			$http.post(BASE_URL + 'tasks/completesubtasks', dataObj, config)
				.then(
					function (response) {
						if(response.data.success == true){
							subtask.complete = true;
							$scope.subtasks.splice($scope.subtasks.indexOf(subtask), 1);
							$scope.SubTasksComplete.unshift(subtask);
						} else {
							globals.mdToast('error', response.data.message);
						}
					},
					function (response) {
						console.log(response);
					}
				);
		};

		$scope.uncompleteTask = function (index) {
			var task = $scope.SubTasksComplete[index];
			var dataObj = $.param({
				task: task.id
			});
			$http.post(BASE_URL + 'tasks/uncompletesubtasks', dataObj, config)
				.then(
					function (response) {
						if(response.data.success == true) {
							var task = $scope.SubTasksComplete[index];
							$scope.SubTasksComplete.splice($scope.SubTasksComplete.indexOf(task), 1);
							$scope.subtasks.unshift(task);
						} else {
							globals.mdToast('error', response.data.message);
						}
					},
					function (response) {
						console.log(response);
					}
				);
		};

	});

	$http.get(BASE_URL + 'tasks/subtaskscomplete/' + TASKID).then(function (SubTasksComplete) {
		$scope.taskCompletionTotal = function (unit) {
			var total = $scope.taskLength();
			return Math.floor(100 / total * unit);
		};
		$scope.SubTasksComplete = SubTasksComplete.data;
		$scope.taskLength = function () {
			return $scope.subtasks.length + $scope.SubTasksComplete.length;
		};
	});

	$scope.MarkAsCompleteTask = function () {
		var dataObj = $.param({
			task: TASKID,
		});
		$http.post(BASE_URL + 'tasks/markascompletetask', dataObj, config)
			.then(
				function (response) {
					if(response.data.success == true) {
						globals.mdToast('success', response.data.message);
					} else {
						globals.mdToast('error', response.data.message);
					}
				},
				function (response) {
					console.log(response);
				}
			);
	};

	$scope.MarkAsCancelled = function () {
		var dataObj = $.param({
			task: TASKID,
		});
		$http.post(BASE_URL + 'tasks/markascancelled', dataObj, config)
			.then(
				function (response) {
					if(response.data.success == true) {
						globals.mdToast('success', response.data.message);
					} else {
						globals.mdToast('error', response.data.message);
					}
				},
				function (response) {
					console.log(response);
				}
			);
	}; 
}

CiuisCRM.controller('Contacts_Controller', Contacts_Controller);
CiuisCRM.controller('Contact_Controller', Contact_Controller);
