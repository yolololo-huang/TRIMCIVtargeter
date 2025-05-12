<script setup lang="ts">
  import TRIMs_infoTab from '@/assets/TRIMs_infoTab.json'
</script>

<template>
  <el-card class="TRIMReview">
    <template #header>
      <div
        class="card-header"
        style="color: rgb(70, 0, 136); font-size: 20px; font-weight: bold; margin-bottom: 10px"
      >
        Classification of TRIM Family
      </div>
    </template>
    <div>
      <span
        >Tripartite Motif (TRIM) Family Proteins display a common domain architecture. Most of the
        TRIM family proteins have been defined as E3 ubiquitin ligases for containing RING domain,
        and was classified into 11 group (CI to CXI) based on a variable C-terminal domain; UC is
        additional unclassified group lacking a RING domain.
        <!-- <a href="https://doi.org/10.1016/j.tibs.2017.01.002">(Shigetsugu Hatakeyama,2017)</a> -->
      </span>
    </div>

    <el-table :data="TRIMs_infoTab" style="width: 100%" max-height="1500">
      <el-table-column type="expand">
        <template #default="props">
          <div>
            <el-table :data="props.row.members">
              <el-table-column prop="group" label="Group" width="70"></el-table-column>
              <el-table-column prop="Hovername" label="TRIM name" width="135"></el-table-column>
              <el-table-column label="Entry" width="90">
                <template #default="scope">
                  <a
                    :href="`https://www.uniprot.org/uniprotkb/${scope.row.Entry}`"
                    target="_blank"
                    >{{ scope.row.Entry }}</a
                  >
                </template>
              </el-table-column>
              <el-table-column label="Domains" width="430">
                <template #default="scope">
                  <div v-html="scope.row['Domain svg']"></div>
                </template>
              </el-table-column>
              <el-table-column prop="Length" label="Length" width="73"></el-table-column>
              <el-table-column label="N-C Split Position" width="160">
                <template #default="scope">
                  {{ Math.floor(scope.row['C_start']) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="group" label="Group" width="150"></el-table-column>
      <el-table-column prop="count" label="Counts of members" width="200"></el-table-column>
      <el-table-column label="Group Domain Overview" width="600">
        <template #default="scope">
          <div v-html="scope.row['Domain svg']"></div>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <div class="card-intro-footer">
        <div>
          The N-terminal contains one RING-finger domain (
          <span class="Nter_highlight">R</span>
          ), one or two zinc-finger domains named B boxes (
          <span class="Nter_highlight">B1</span> and <span class="Nter_highlight">B2</span>), and
          coiled-coil region(
          <span class="Nter_highlight">CC</span>

          ); The C-terminal contains variable domains:COS domain, fibronectin type III repeat (
          <span class="Cter_highlight">FNIII</span>
          ), PRY domain, SPRY domain, acid-rich region (
          <span class="Cter_highlight">ACID</span>
          ), filamin-type IG domain (
          <span class="Cter_highlight">FIL</span>
          ), <span class="Cter_highlight">NHL</span> domain,
          <span class="Cter_highlight">PHD</span> domain, bromodomain (
          <span class="Cter_highlight">BROMO</span>
          ), Meprin and TRAF-homology domain (
          <span class="Cter_highlight">MATH</span>
          ), ADP-ribosylation factor family domain (
          <span class="Cter_highlight">ARF</span>
          ), and transmembrane region (
          <span class="Cter_highlight">TM</span>
          ).
        </div>
        <div>*Length: The length of the protein sequence.</div>
        <div>
          *N-C Split point: where the C terminal structure was splited from the TRIM protein to
          calculated the structure similarity in this research.
        </div>
      </div>
    </template></el-card
  >
</template>

<style lang="scss" scoped>
  .Nter_highlight {
    background-color: #bbd0ff;
    font-weight: 500;
  }
  .Cter_highlight {
    background-color: #8c07dd;
    font-weight: 500;
  }
</style>
