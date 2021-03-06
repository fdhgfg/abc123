using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using System.Data.SqlClient;
using TygaSoft.Model;

namespace TygaSoft.IDAL
{
    public partial interface IOrgDepmt
    {
        #region IOrgDepmt Member

        OrgDepmtInfo GetModel(string code, string name);

        bool IsExistCode(string code, Guid Id);

        bool IsExistChild(Guid Id);

        #endregion
    }
}
