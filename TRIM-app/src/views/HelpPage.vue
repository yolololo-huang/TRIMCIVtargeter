<script setup lang="ts">
const scrollTo = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <el-header>
    <AppHeader />
  </el-header>
  <div style="width: 1500px; margin: auto; align-items: center; justify-content: center">
    <el-row>
      <el-col :span="4">
        <el-affix>
          <el-menu default-active="2" class="el-menu-vertical">
            <el-menu-item index="1">
              <a @click="scrollTo('about-trimcivtargeter')">About TRIMCIVtargeter</a>
            </el-menu-item>
            <el-menu-item index="2">
              <a @click="scrollTo('help-page')">Help Page</a>
            </el-menu-item>
            <el-sub-menu index="3">
              <template #title>Submission</template>
              <el-menu-item index="3-1">
                <a @click="scrollTo('search-by-target')">Search by Target</a>
              </el-menu-item>
              <el-menu-item index="3-2">
                <a @click="scrollTo('search-by-trimciv-member')">Search by TRIMCIV Member</a>
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="4">
              <template #title>Results Page</template>
              <el-menu-item index="4-1">
                <a @click="scrollTo('results-search-by-target')">Search by Target</a>
              </el-menu-item>
              <el-menu-item index="4-2">
                <a @click="scrollTo('results-search-by-trimciv-member')"
                  >Search by TRIMCIV Member</a
                >
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="5">
              <template #title>Additional Pages</template>
              <el-menu-item index="5-1">
                <a @click="scrollTo('trim-family-review')">TRIM Family Review</a>
              </el-menu-item>
              <el-menu-item index="5-2">
                <a @click="scrollTo('pan-cancer-landscape')">Pan-Cancer Landscape</a>
              </el-menu-item>
              <el-menu-item index="5-3">
                <a @click="scrollTo('trim-target-pairs-reported-repository')"
                  >TRIM-Target Pairs Reported Repository</a
                >
              </el-menu-item>
              <el-menu-item index="6">
                <a @click="scrollTo('data-source-and-overview')">Data Source and Overview</a>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item index="7">
              <a @click="scrollTo('submit-newly-found-trim-target-pairs')"
                >Submit New TRIM-Target Pairs</a
              >
            </el-menu-item>
            <el-menu-item index="8">
              <a @click="scrollTo('contact-us')">Contact Us</a>
            </el-menu-item>
          </el-menu>
        </el-affix>
      </el-col>
      <el-col :span="20">
        <el-main>
          <el-card>
            <section id="about-trimcivtargeter">
              <h2>About TRIMCIVtargeter</h2>
              <p>
                TRIMCIVtargeter is a user-friendly web server designed to provide the prediction for
                potential targets (generally including substrates and interactors) of TRIMCIV
                members utilizing machine learning (SVM). By integrating data from proteomic and
                transcriptomic datasets across multiple cancer types, TRIMCIVtargeter provides an
                intuitive platform for researchers to explore the interactions and functional
                associations of TRIM family members.
              </p>
            </section>
            <section id="help-page">
              <h2>Help Page</h2>
              <p>All graphs are interactive on this webserver.</p>
              <h3>Submission</h3>
              <h4 id="search-by-target">Search by Target</h4>
              <ol>
                <div class="help-img">
                  <img src="/tmp/helppage/sByGN_s1.png" alt="Search by Gene Name" width="70%" />
                </div>
                <li>
                  <strong>Step 1:</strong> Click on the input field in Step 1 and enter the gene
                  name of the protein you are interested in. The UniProt ID will automatically
                  populate for most cases. Note that our database includes about 13,091 unique gene
                  names, all of which are qualified in at least one dataset. If your input is not
                  recognized, it may indicate that the gene is not a significant DEG, lacks features
                  with the
                  <el-tooltip
                    content="TRIM21, TRIM38, TRIM47, TRIM4, TRIM5, TRIM22, TRIM25, TRIM26,
                      TRIM65, TRIM27, TRIM11, TRIM41, TRIM68, TRIM34, TRIM39,
                      TRIM62, TRIM72"
                    placement="top"
                  >
                    <strong>TRIMCIV on the common list</strong>
                  </el-tooltip>
                  dataset, or is expressed at just too low a level to be recognized. Ensure that the
                  gene name you enter is one the
                  <strong> most one coding for your protein</strong> of interest and check for
                  potential errors.
                </li>
                <div class="help-img">
                  <img src="/tmp/helppage/sByGN_s2.png" alt="Search by Gene Name" width="70%" />
                </div>

                <li>
                  <strong>Step 2:</strong> Once the gene name is selected, the corresponding UniProt
                  ID (typically the top-reviewed SwissProt entry) will be automatically filled.
                  While you may modify the UniProt ID, we recommend using the default ID. If a new
                  UniProt ID is used, the docking process may take additional time, and you may need
                  to provide your email address to receive the results.
                </li>
                <div class="help-img">
                  <img src="/tmp/helppage/sByGN_s3.png" alt="Search by Gene Name" width="70%" />
                </div>

                <li>
                  <strong>Step 3:</strong> Select at least one cancer type from the dropdown list.
                  Only datasets where your input gene is classified as differentially expressed
                  (DEG) in proteomics or transcriptomics will be available. Once selected, click the
                  "Predict" button to proceed to the results page.
                </li>
              </ol>
              <h4 id="search-by-trimciv-member">Search by TRIMCIV Member</h4>
              <div class="help-img">
                <img src="/tmp/helppage/sByTRIM.png" alt="Search by TRIM" width="70%" />
              </div>

              <p>
                The process is similar to <strong>Search by Target</strong>, but instead of entering
                a gene name, input the TRIMCIV member of interest. The UniProt ID will automatically
                populate based on the reviewed PDB data. Note that only
                <el-tooltip
                  content="TRIM21, TRIM38, TRIM47, TRIM4, TRIM5, TRIM22, TRIM25, TRIM26,
                      TRIM65, TRIM27, TRIM11, TRIM41, TRIM68, TRIM34, TRIM39,
                      TRIM62, TRIM72"
                  placement="top"
                >
                  <strong>17 TRIMCIV members</strong>
                </el-tooltip>
                are available for selection, as they are expressed at the protein level across
                pan-cancer datasets. This restriction ensures balanced and confident predictions
                from the two models.
              </p>
              <p>
                After selecting the TRIMCIV member, choose at least one cancer dataset from the
                dropdown menu. The availability of cancer datasets depends on whether expression
                data exists for the selected TRIMCIV member. Click "Predict" to proceed to the
                results page.
              </p>
            </section>
            <section>
              <h3>Results Page</h3>
              <h4 id="results-search-by-target">Results: Searched by Target</h4>
              <div class="help-img">
                <img src="/tmp/helppage/rByGN.png" alt="Result Searched by Target " width="70%" />
              </div>
              <p>The results page provides:</p>

              <ul>
                <li>
                  The features between the searched target and TRIM members are displayed in the
                  Sankey Plot and Radar Plots. All plots can be toggled to hide by clicking the
                  header of the card.
                </li>
                <ol>
                  <li>
                    Displays GO annotation pairs (Molecular Function, Biological Process, Cellular
                    Component). GO terms are sourced from
                    <a href="https://geneontology.org/">Gene Ontology </a> (PANTHER v.17.0, Homo
                    sapiens).
                  </li>
                  <li>Affinity scores between.</li>
                  <li>Correlation coefficients (R).</li>
                </ol>
                <p>
                  4. The above graph display the TRIM CIV members which predicted as True for
                  default properties. While the user can still included all calculated TRIM members
                  from the result by this switch button
                </p>
                <p>5. The result table is filterable by the menu</p>
                <p>
                  6. <strong>Table:</strong> The results table contains 7 default columns and
                  columns are filterable using the left-hand menu. All data can be downloaded for
                  offline analysis. Targets, TRIM members, and GO terms can be hyperlinked to the
                  UniProt database and QuickGO database for further exploration. The item with blue
                  background represented the reported TRIM-target pair.
                </p>
                <p>
                  7. Use the "About Column" button to view detailed explanations for each column.
                </p>
              </ul>

              <h4 id="results-search-by-trimciv-member">Results: Searched by TRIMCIV Member</h4>
              <div class="help-img">
                <img src="/tmp/helppage/rByTRIM.png" alt="Result Searched by TRIM " width="70%" />
              </div>
              <p>
                Similar to the <strong>Search by Target</strong> results page, the differences
                includes:
              </p>
              <ol>
                <li>Menus to filter data for both the table and plots.</li>
                <li>
                  A Sankey plot and radar plot showcasing the top 20 targets as default property
                  ranked by ZR scores.
                </li>
              </ol>
            </section>
            <section>
              <h3>Reference Cards</h3>
              <h4 id="trim-family-review">TRIM Family Review</h4>
              <p>Provides an overview of the TRIM family, including:</p>
              <ol>
                <div class="help-img">
                  <img src="/tmp/helppage/reviewDomain.png" alt="Review " width="70%" />
                </div>
                <li>
                  Family domains distribution. Click the TRIM member could access to the PDB
                  struture supported by molstar.
                </li>
                <div class="help-img">
                  <img src="/tmp/helppage/reviewTree.png" alt="Review " width="70%" />
                </div>
                <li>The graphical representation of family relationship in a phylogenetic tree.</li>
                <div class="help-img">
                  <img src="/tmp/helppage/reviewC.png" alt="Review " width="70%" />
                </div>
                <li>The subgroup classifications of grouping TRIM family focusing on C domain</li>
              </ol>

              <h4 id="pan-cancer-landscape">Pan-Cancer Landscape</h4>
              <div class="help-img">
                <img src="/tmp/helppage/pancancer.png" alt="Review " width="70%" />
              </div>
              <p>
                Visualizes differentially expressed genes (DEGs) and their correlations with TRIM
                members across various cancer datasets. Tables can be filtered by gene name, TRIM
                name, and cancer types. Downloads are supported.
              </p>
              <h4 id="trim-target-pairs-reported-repository">
                TRIM-Target Pairs Reported Repository
              </h4>
              <div class="help-img">
                <img src="/tmp/helppage/reported.png" alt="Review " width="70%" />
              </div>
              <p>
                Manually curated data on reported substrates and interactors of TRIM members. Use
                the filters to explore specific TRIM groups or individual TRIM members. Results are
                displayed in an interactive table and plot.
              </p>
            </section>
            <section id="data-source-and-overview">
              <h4>Data Source and Overview</h4>
              <div class="help-img">
                <img src="/tmp/helppage/dataSource.png" alt="Review " width="70%" />
              </div>
              <p>Detailed information about datasets and sources:</p>
              <ol>
                <li>
                  An interactive bar graph summarizes the prediction statistics in each datasets,
                  including true/false ratios, DEGs, and total gene counts.Clicking on the bar will
                  display a radial bar chart.
                </li>
                <li>
                  The radial barchart showcases the count of predicted true targets for each TRIMCIV
                  member in the corresponding cancer type.
                  <strong>Click the TRIM bar on the radial graph</strong>
                  would bring you to the result page, which is equally searched by TRIM and cancer
                  type.
                </li>
                <li>
                  Users can download prediction results (including false positives) for specific
                  datasets.
                </li>
              </ol>
            </section>
            <section id="submit-newly-found-trim-target-pairs">
              <h3>Submit Newly Found TRIM-Target Pairs</h3>
              <div class="help-img">
                <img src="/tmp/helppage/submitNew.png" alt="submit " width="70%" />
              </div>
              <p>
                We welcome your contributions to update and expand our database with newly
                identified TRIM-target pairs. The entry are provided at the end of the home page.
              </p>
            </section>
            <section id="contact-us">
              <h3>Contact Us</h3>

              <p>
                If you encounter any issues using TRIMCIVtargeter or have suggestions or feedback,
                please reach out to us via the
                <router-link to="/contact" class="nav-link">Contact</router-link> page.
              </p>
            </section>
          </el-card>
        </el-main>
      </el-col>
    </el-row>
  </div>

  <el-footer>
    <AppFooter />
  </el-footer>
</template>

<style scoped>
.el-card:hover {
  box-shadow: 0 0px 20px rgba(143, 118, 255, 0.459);
  transition: box-shadow 0.3s ease-in-out;
}
.el-menu-vertical {
  margin: auto;
  width: 100%;
}

.help-img {
  margin-top: 10px;
  text-align: center;
  margin-bottom: 10px;
}
</style>
