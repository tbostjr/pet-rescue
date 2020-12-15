$(() => {
  $("#adoption-submit-btn").on("click", (evt) => {
    evt.preventDefault();

    const formData = $("#adoptionForm").serialize();

    $.ajax({
      url: "/api/animal/validate",
      method: "POST",
      data: formData,
      dataType: "json",
    }).done((res) => {
      console.log("Help");
      if (res.error) {
        $("#error").html(res.error);
      } else {
        $("#adoptionForm").trigger("submit");
      }
    });
  });

  $("#animal").on("change", (evt) => {
    $("#search").trigger("submit");
  });
  $("#breed").on("change", (evt) => {
    $("#search").trigger("submit");
  });
  $("#age").on("change", (evt) => {
    $("#search").trigger("submit");
  });
  $("#sort").on("change", (evt) => {
    $("#search").trigger("submit");
  });
  $("#addAnimal").on("submit", (evt) => {
    evt.preventDefault();
    const formData = new FormData($("#addAnimal").get(0));
    $("#spinner").show(); // Look here
    $("#addAnimal").hide(); // Look here
    $.ajax({
      url: "/api/animal/add-animal-validate",
      dataType: "json",
      data: formData,
      method: "POST",
      processData: false,
      contentType: false,
    }).done((res) => {
      $("#spinner").hide(); // Look here
      if (res.error) {
        $("#addAnimal").show(); // Look here
        $("#error").html(res.error);
      } else {
        $("#success").show(); // Look here
      }
    });
  });

  $("#editAnimal").on("submit", (evt) => {
    evt.preventDefault();
    const formData = new FormData($("#editAnimal").get(0));
    $("#spinner").show();
    $("#editAnimal").hide();
    $.ajax({
      url: "/api/animal/edit-animal-validate",
      dataType: "json",
      data: formData,
      method: "POST",
      processData: false,
      contentType: false,
    }).done((res) => {
      $("#spinner").hide();
      if (res.error) {
        $("#editAnimal").show();
        $("#error").html(res.error);
      } else {
        $("#success").show();
      }
    });
  });

  $("#modal-delete .modal-deny").on("click", (evt) => {
    $(".modal").hide();
  });

  $("#modal-error .modal-deny").on("click", (evt) => {
    location.reload();
  });

  $(".deleteBtn").on("click", (evt) => {
    evt.preventDefault();
    console.log(evt);
    $("#modal-delete .modal-title").html(
      "Are you sure you want to delete this animal?"
    );
    $("#modal-delete .modal-body .text-danger").html(
      "This action can not be undone or reverted. "
    );
    $("#modal-delete .modal-body .info").html(
      $(evt.currentTarget).attr("href")
    );
    $("#modal-delete").show();
  });

  $(".modal-confirm").on("click", (evt) => {
    $("#modal-delete").hide();
    $.ajax({
      url: $("#modal-delete .modal-body .info").html(),
      method: "delete",
      dataType: "json",
    }).done((res) => {
      if (res.error) {
        $("#modal-error .modal-title").html("Something went wrong?");
        $("#modal-error .modal-body .text-danger").html(res.error);
        $("#modal-error").show();
      } else {
        $("#modal-error .modal-title").html(res.message);
        $("#modal-error .modal-body").html(
          "Page will refresh when this window closes"
        );
        $("#modal-error").show();
      }
    });
  });
});
