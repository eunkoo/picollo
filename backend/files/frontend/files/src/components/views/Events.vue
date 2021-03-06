<template>
  <div class="events">
    <div class="text-xs-center">
      <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
    </div>
    <v-snackbar :value="alert" top color="error" icon="error_circle" outlined>{{alertMsg}}</v-snackbar>
    <div class="formodal">
      <v-dialog v-model="dialog" max-width="800px">
        <template v-slot:activator="{ on }">
          <v-btn small fab color="primary" dark v-on="on" class="mb-2">
            <v-icon dark>add</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field label="예배명" v-model="editedItem.name"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-menu
                    ref="date_menu"
                    :close-on-content-click="false"
                    v-model="date_menu"
                    :nudge-right="40"
                    :return-value.sync="editedItem.start"
                    
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-on="on"
                        v-model="editedItem.start"
                        label="시작"
                        prepend-icon="event"
                        readonly
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      class="mydatepicker"
                      locale="ko-KR"
                      v-model="editedItem.start"
                      no-title
                      @input="$refs.date_menu.save(editedItem.start)"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-menu
                    ref="edate_menu"
                    :close-on-content-click="false"
                    v-model="edate_menu"
                    :nudge-right="40"
                    :return-value.sync="editedItem.end"
                    
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-on="on"
                        v-model="editedItem.end"
                        label="종료"
                        prepend-icon="event"
                        readonly
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      class="mydatepicker"
                      locale="ko-KR"
                      v-model="editedItem.end"
                      no-title
                      @input="$refs.edate_menu.save(editedItem.end)"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-select
                    label="부서"
                    :items="belong_items"
                    v-model="belong_items[editedItem.belongs]"
                    single-line
                    item-text="text"
                    item-value="id"
                    return-object
                    persistent-hint
                    @change="changeBelong"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field label="장소" v-model="editedItem.place"></v-text-field>
                </v-col>
                <!-- <v-col xs12 sm6 md4>
                  <v-text-field label="재적 총원" v-model="editedItem.totalmember"></v-text-field>
                </v-col>-->
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" @click.native="save">저장</v-btn>
            <v-btn color="blue darken-1" @click.native="close">취소</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <v-card-title>
      <h2>예배 정보</h2>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="search"
        label="예배명 또는 날짜"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>

    <v-data-table :headers="headers" :items="events" :search="search" sort-by="start" sort-desc>
      <template v-slot:item.belongs="{ item }">
        <v-col align="center">{{ belong_text(item.belongs) }}</v-col>
      </template>

      <template v-slot:item.go="{ item }">
        <td class="text-xs-left" @click="go(item)">
          <v-btn small text fab color="blue">
            <v-icon>call_made</v-icon>
          </v-btn>
        </td>
      </template>

      <template v-slot:item.edit="{ item }">
        <td class="justify-center layout px-0">
          <v-btn icon class="mx-0" @click="editItem(item)">
            <v-icon color="teal">edit</v-icon>
          </v-btn>
          <v-btn icon class="mx-0" @click="deleteEvents(item)">
            <v-icon color="pink">delete</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
const apiService = require("@/Services/ApiService");
const Datepicker = require("vuejs-datepicker");
require("../../assets/css/events.css");

module.exports = {
  name: "events",
  components: {
    Datepicker
  },
  data() {
    return {
      alert: false,
      search: "",
      alertMsg: "",
      loading: false,
      events: [],
      dialog: false,
      // cdate: new Date(),
      belong_items: [
        { text: "유치부", id: 0 },
        { text: "유초등부", id: 1 },
        { text: "중고등부", id: 2 },
        { text: "청년부", id: 3 }
        // { text: '면려회', id: '4' }
      ],
      pagination: {
        sortBy: "start", // The field that you're sorting by
        descending: true,
        // page: 1,
        rowsPerPage: 10
        // totalItems: 0,
        // rowsPerPageItems: [5, 10, 15, 20, 25]
      },

      cbelong: -1,
      editedIndex: -1,
      date_menu: null,
      edate_menu: null,
      defaultItem: {
        name: "",
        place: "",
        start: new Date().toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10),
        belongs: ""
      },
      editedItem: {
        id: "",
        name: "",
        place: "",
        start: new Date().toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10),
        belongs: this.cbelong,
        totalmember: 0
      },
      headers: [
        {
          text: "소속",
          align: "left",
          sortable: true,
          value: "belongs"
        },
        {
          text: "예배명",
          align: "left",
          sortable: false,
          value: "name"
        },
        {
          text: "시작",
          align: "left",
          sortable: true,
          value: "start"
        },
        {
          text: "종료",
          align: "left",
          sortable: false,
          value: "end"
        },
        {
          text: "장소",
          align: "left",
          sortable: false,
          value: "place"
        },
        {
          text: "총원",
          align: "left",
          sortable: false,
          value: "totalmember"
        },
        { text: "바로가기", value: "go", sortable: false },
        { text: "편집", value: "edit", sortable: false }
      ]
    };
  },
  mounted() {
    this.getevents();
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "새 예배" : "정보 수정";
    }
  },
  watch: {
    dialog(val) {
      val || this.close();
    }
  },
  methods: {
    daySort(items, index, isDesc) {
      items.sort((a, b) => {
        if (index === "start") {
          if (!isDesc) {
            return b.start - a.start;
          } else {
            return a.start - b.start;
          }
        }
      });
      return items;
    },
    belong_text: function(belong) {
      if (belong === 0) return "유치부";
      if (belong === 1) return "유초등부";
      if (belong === 2) return "중고등부";
      if (belong === 3) return "청년부";
    },
    async getevents() {
      this.loading = true;
      const response = await apiService.fetchEvents();
      this.events = response.data;
      this.loading = false;
    },
    async changeBelong(selectObj) {
      console.log("chagne belong " + selectObj.id);
      this.editedItem.belongs = selectObj.id;
      this.getTotalMember();
    },
    onSelected(selected) {
      this.cdate = selected;
    },
    async getTotalMember() {
      const response = await apiService.fetchNames({
        belong: this.editedItem.belongs
      });
      var names = response.data.filter(mem => {
        return mem.grade == 0;
      });
      this.editedItem.totalmember = names.length;
      // console.log(this.editedItem.totalmember);
    },
    go(items) {
      // window.history.replaceState([{day:'items.day'},{"belongs":"items.belongs"}],'','#/api/attendee')
      // window.history.go('#/api/attendee')

      this.$router.push(
        "/data/dataInnerSchedule/" + items.start + "/" + items.end + "/" + items.belongs
      );
      this.$router.go({
        name: "dataInnerSchedule",
        params: [
          { start: items.start },
          { end: items.end },
          { belongs: items.belongs }
        ]
      });
    },
    async save() {
      try {
        if (this.editedIndex === -1) {
          apiService.checkEvents(this.editedItem).then(result => {
            console.log(result);
            if (result.data !== "") {
              //error
              this.alert = true;
              this.alertMsg = "이미 등록된 이벤트 입니다";
              setTimeout(() => {
                this.alert = !this.alert;
              }, 3000);
            } else {
              
              apiService.addEvents(this.editedItem).then(result => {
                this.editedItem = Object.assign({}, result.data);
                this.events.push(this.editedItem);
              });
            }
          });
        } else {
          console.log(this.editedItem);
          apiService.updateEvents(this.editedItem);
          Object.assign(this.events[this.editedIndex], this.editedItem);
        }
        this.close();
      } catch (err) {
        return console.log(err.message);
      } finally {
      }
    },

    async deleteEvents(events) {
      const $this = this;
      $this
        .$swal({
          title: "삭제 하시겠습니까",
          text: "삭제되면 다시 되돌릴 수 없습니다",
          type: "warning",
          showCancelButton: true,
          cancelButtonText: "아니요",
          confirmButtonText: "네 삭제 합니다"
        })
        .then(result => {
          if (result.value) {
            apiService.deleteEvents(events.id);
            const index = this.events.indexOf(events);
            this.events.splice(index, 1);
          }
        });
    },

    editItem(item) {
      this.editedIndex = this.events.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    }
  }
};
</script>


